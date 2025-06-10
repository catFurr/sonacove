#!/usr/bin/env bun

import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { promisify } from "util";

// Utility function to execute commands and log output in real-time
async function runCommand(command: string, cwd?: string): Promise<void> {
  const actualCwd = cwd || process.cwd();
  console.log(`\n🚀 Running: ${command} (in ${actualCwd})`);

  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(" ");
    // Use shell: true for commands like 'make all' or if using &&, ||, etc.
    // For simple commands, it might be safer to set shell based on command complexity
    // or by requiring the user to be explicit if shell features are needed.
    // For `npm run build` or `make all`, shell:true is generally fine.
    const child = spawn(cmd, args, {
      cwd: actualCwd,
      shell: true,
      stdio: "pipe",
    });

    child.stdout.on("data", (data) => {
      process.stdout.write(data);
    });

    child.stderr.on("data", (data) => {
      process.stderr.write(data);
    });

    child.on("close", (code) => {
      if (code === 0) {
        // Adding a newline for cleaner separation after command output
        process.stdout.write("\n");
        console.log(`✅ Command finished: ${command}`);
        resolve();
      } else {
        process.stdout.write("\n");
        console.error(`❌ Command failed with code ${code}: ${command}`);
        // No process.exit(1) here, let the main deploy() catch block handle it
        reject(new Error(`Command failed with code ${code}: ${command}`));
      }
    });

    child.on("error", (err) => {
      process.stdout.write("\n");
      console.error(`❌ Error executing command: ${command}`);
      console.error(err);
      reject(err); // Let the main deploy() catch block handle process.exit
    });
  });
}

// Check if a command exists in the PATH
async function commandExists(command: string): Promise<boolean> {
  try {
    // Using a simple platform-agnostic check
    await runCommand(
      process.platform === "win32" ? `where ${command}` : `which ${command}`
    );
    return true;
  } catch (error) {
    return false;
  }
}

// Utility function to ensure a directory exists
function ensureDirectoryExists(dirPath: string, isTopLevelCall = true): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    if (isTopLevelCall) {
      console.log(`📁 Created directory: ${dirPath}`);
    }
  }
}

// Utility function to copy a file or directory
function copyFileOrDirectory(
  source: string,
  destination: string,
  isTopLevelCall = true
): void {
  if (!fs.existsSync(source)) {
    console.error(`❌ Source does not exist: ${source}`);
    process.exit(1); // Exit if a crucial source is missing
  }

  const stats = fs.statSync(source);

  if (stats.isDirectory()) {
    if (isTopLevelCall) {
      console.log(`📋 Copying directory: ${source} -> ${destination}`);
    }
    ensureDirectoryExists(destination, isTopLevelCall);
    const files = fs.readdirSync(source);
    for (const file of files) {
      copyFileOrDirectory(
        path.join(source, file),
        path.join(destination, file),
        false
      );
    }
  } else {
    // It's a file
    ensureDirectoryExists(path.dirname(destination), isTopLevelCall);
    fs.copyFileSync(source, destination);
    if (isTopLevelCall) {
      // Only log if this function was called directly for a single file
      console.log(`📋 Copied file: ${source} -> ${destination}`);
    }
  }
}

/**
 * Parses a .env file and returns its key-value pairs.
 * @param filePath - The path to the .env file.
 * @returns An object representing the environment variables.
 */
function loadEnvFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ Environment file not found: ${filePath}`);
    return {};
  }
  const content = fs.readFileSync(filePath, "utf-8");
  const envVars: Record<string, string> = {};
  content.split("\n").forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith("#")) {
      const [key, ...valueParts] = trimmedLine.split("=");
      const value = valueParts.join("=").trim();
      // Remove surrounding quotes if present (handles both ' and ")
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        envVars[key.trim()] = value.slice(1, -1);
      } else {
        envVars[key.trim()] = value;
      }
    }
  });
  return envVars;
}

/**
 * Recursively find all TypeScript files in a directory.
 * @param dir - The directory to search.
 * @returns An array of paths to .ts files.
 */
function findTypeScriptFilesRecursive(dir: string): string[] {
  let tsFiles: string[] = [];
  if (!fs.existsSync(dir)) {
    console.warn(`⚠️ Directory not found for TS file search: ${dir}`);
    return tsFiles;
  }
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      tsFiles = tsFiles.concat(findTypeScriptFilesRecursive(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".ts")) {
      tsFiles.push(fullPath);
    }
  }
  return tsFiles;
}

/**
 * Process SSI directives in HTML files
 * @param filePath - The path to the HTML file
 * @param depth - Current recursion depth
 * @param includedFiles - Set of already included files to prevent cycles
 * @param meetRootDir - The root directory for meet (for resolving paths with leading slash)
 */
function processSSI(
  filePath: string,
  meetRootDir: string, // Moved meetRootDir up for clarity, it's essential
  depth = 0,
  includedFiles = new Set<string>()
): void {
  const MAX_DEPTH = 3;

  if (depth >= MAX_DEPTH) {
    console.warn(
      `⚠️ SSI processing reached max depth of ${MAX_DEPTH} for ${filePath}, stopping recursion`
    );
    return;
  }

  console.log(`🔄 Processing SSI in: ${filePath}`);

  try {
    let html = fs.readFileSync(filePath, "utf8");
    const ssiPattern = /<!--#include\s+virtual="([^"]+)"\s*-->/g;
    const fileDir = path.dirname(filePath);

    html = html.replace(ssiPattern, (fullMatch, includePath) => {
      try {
        let resolvedPath: string;
        if (includePath.startsWith("/")) {
          resolvedPath = path.join(meetRootDir, includePath.substring(1));
        } else {
          resolvedPath = path.resolve(fileDir, includePath);
        }

        if (includedFiles.has(resolvedPath)) {
          console.warn(`⚠️ SSI circular include detected: ${resolvedPath}`);
          return "<!-- SSI circular include detected -->";
        }

        if (fs.existsSync(resolvedPath)) {
          const content = fs.readFileSync(resolvedPath, "utf8");
          includedFiles.add(resolvedPath);
          const includeDir = path.dirname(resolvedPath);
          return processSSIContent(
            content,
            includeDir,
            meetRootDir,
            depth + 1,
            new Set([...includedFiles])
          );
        }

        console.warn(`⚠️ SSI include file not found: ${resolvedPath}`);
        return `<!-- SSI include file not found: ${resolvedPath} -->`;
      } catch (err: any) {
        console.error(`❌ SSI include error for ${includePath}:`, err);
        return `<!-- SSI error: ${err.message} -->`;
      }
    });
    fs.writeFileSync(filePath, html);
  } catch (err: any) {
    console.error(`❌ Error processing SSI in ${filePath}:`, err);
  }
}

function processSSIContent(
  content: string,
  baseDir: string,
  meetRootDir: string,
  depth = 0,
  includedFiles = new Set<string>()
): string {
  const MAX_DEPTH = 3;
  if (depth >= MAX_DEPTH) {
    console.warn(
      `⚠️ SSI content processing reached max depth of ${MAX_DEPTH}, stopping recursion`
    );
    return content;
  }
  const ssiPattern = /<!--#include\s+virtual="([^"]+)"\s*-->/g;
  return content.replace(ssiPattern, (fullMatch, includePath) => {
    try {
      let resolvedPath: string;
      if (includePath.startsWith("/")) {
        resolvedPath = path.join(meetRootDir, includePath.substring(1));
      } else {
        resolvedPath = path.resolve(baseDir, includePath);
      }

      if (includedFiles.has(resolvedPath)) {
        console.warn(`⚠️ SSI circular include detected: ${resolvedPath}`);
        return "<!-- SSI circular include detected -->";
      }
      if (fs.existsSync(resolvedPath)) {
        const includeContent = fs.readFileSync(resolvedPath, "utf8");
        includedFiles.add(resolvedPath);
        const includeDir = path.dirname(resolvedPath);
        return processSSIContent(
          includeContent,
          includeDir,
          meetRootDir,
          depth + 1,
          new Set([...includedFiles])
        );
      }
      console.warn(`⚠️ SSI include file not found: ${resolvedPath}`);
      return `<!-- SSI include file not found: ${resolvedPath} -->`;
    } catch (err: any) {
      console.error(`❌ SSI include error for ${includePath}:`, err);
      return `<!-- SSI error: ${err.message} -->`;
    }
  });
}

function processDirectoryForSSI(directory: string, meetRootDir: string): void {
  if (!fs.existsSync(directory)) {
    console.error(`❌ Directory does not exist: ${directory}`);
    return;
  }
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      processDirectoryForSSI(filePath, meetRootDir);
    } else if (filePath.endsWith(".html")) {
      processSSI(filePath, meetRootDir, 0, new Set());
    }
  }
}

async function buildFunctions(functionsDir: string): Promise<void> {
  console.log(`\n🔨 Building TypeScript functions in ${functionsDir}`);
  if (!fs.existsSync(functionsDir)) {
    console.warn(
      `⚠️ Functions directory does not exist: ${functionsDir}, skipping build.`
    );
    return;
  }

  const tsFiles = findTypeScriptFilesRecursive(functionsDir);
  if (tsFiles.length === 0) {
    console.log(
      "📝 No TypeScript files found in functions directory or its subdirectories, skipping build."
    );
    return;
  }
  console.log(`Found TypeScript files to compile: ${tsFiles.join(", ")}`);

  const tsConfigPath = path.join(functionsDir, "tsconfig.json");
  const needsNewTsConfig = !fs.existsSync(tsConfigPath);
  if (needsNewTsConfig) {
    const tsConfigContent = {
      compilerOptions: {
        target: "es2022",
        module: "commonjs", // Or "esnext" if your CF environment supports ESM for workers
        esModuleInterop: true,
        outDir: "./", // Output JS files alongside TS files
        sourceMap: true,
        strict: true,
        resolveJsonModule: true, // Often useful
        lib: ["es2022", "dom"], // Add "dom" if using any browser-like globals, though less common for CF functions
      },
      include: ["./**/*.ts"],
      exclude: ["node_modules", "./**/*.spec.ts"], // Exclude test files
    };
    fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfigContent, null, 2));
    console.log(`📝 Created temporary tsconfig.json in ${functionsDir}`);
  }

  const packageJsonPath = path.join(functionsDir, "package.json");
  if (fs.existsSync(packageJsonPath)) {
    console.log(
      `📦 Found package.json in ${functionsDir}, running npm install...`
    );
    await runCommand("npm install", functionsDir);
  }

  // console.log("Compiling TypeScript functions...");
  // await runCommand("npx tsc", functionsDir);

  if (needsNewTsConfig) {
    fs.unlinkSync(tsConfigPath);
    console.log(`🧹 Removed temporary tsconfig.json from ${functionsDir}`);
  }
  console.log("✅ Functions build completed.");
}

/**
 * Updates the base href in base.html from "/" to "/meet/"
 * Critical for proper path resolution in the Jitsi Meet interface
 * @param {string} meetDir - Directory containing the meet files
 * @throws {Error} If base.html is missing or doesn't contain expected base tag
 */
function updateBaseHref(meetDir: string): void {
  console.log("\n🔄 Updating base href in base.html");
  const baseHtmlPath = path.join(meetDir, "base.html");

  if (!fs.existsSync(baseHtmlPath)) {
    throw new Error(`Critical file base.html not found at ${baseHtmlPath}`);
  }

  try {
    let baseHtmlContent = fs.readFileSync(baseHtmlPath, "utf-8");

    // Use a flexible regex that can handle variations in spacing/quotes
    const baseHrefRegex = /<base\s+href\s*=\s*["']?\/?["']?\s*\/?>/i;

    if (!baseHrefRegex.test(baseHtmlContent)) {
      throw new Error(
        `Could not find base href tag in expected format in ${baseHtmlPath}`
      );
    }

    baseHtmlContent = baseHtmlContent.replace(
      baseHrefRegex,
      '<base href="/meet/"/>'
    );

    fs.writeFileSync(baseHtmlPath, baseHtmlContent, "utf-8");
    console.log(`✅ Updated base href in ${baseHtmlPath}`);
  } catch (error) {
    // Rethrow with context if it's not our error
    if (!(error instanceof Error)) {
      throw new Error(
        `Failed to update base href in ${baseHtmlPath}: ${error}`
      );
    }
    throw error;
  }
}

/**
 * Copies and updates the wrangler.jsonc configuration file
 * @param cfBuildDir - The cf-build directory path
 * @param sonaPath - The sonacove project path
 */
async function updateWranglerConfig(
  cfBuildDir: string,
  sonaPath: string
): Promise<void> {
  console.log(
    "\n🔧 Step 3.5: Copying and updating wrangler.jsonc configuration"
  );

  const sourceWranglerConfigPath = path.join(sonaPath, "wrangler.jsonc");
  const wranglerConfigPathInCfBuild = path.join(cfBuildDir, "wrangler.jsonc");

  // Check if wrangler.jsonc exists in project root
  if (!fs.existsSync(sourceWranglerConfigPath)) {
    console.error(
      `❌ Source wrangler.jsonc not found at ${sourceWranglerConfigPath}. Cannot proceed with deployment.`
    );
    process.exit(1);
  }

  // Copy wrangler.jsonc to cf-build directory
  fs.copyFileSync(sourceWranglerConfigPath, wranglerConfigPathInCfBuild);
  console.log(
    `📋 Copied ${sourceWranglerConfigPath} to ${wranglerConfigPathInCfBuild}`
  );
}

async function deploy() {
  const sonaPath = process.cwd();
  const cfBuildDir = path.join(sonaPath, "cf-build");
  const meetDir = path.join(cfBuildDir, "meet");
  const projectRootDir = path.resolve(sonaPath, "..", "jitsi-meet");

  // Parse command line arguments
  const args = process.argv.slice(2); // Exclude 'bun' and 'deploy-cf.ts'
  const skipJitsiBuild = args.includes("--skip-build");
  const isDevMode = args.includes("--dev");

  if (skipJitsiBuild) {
    console.log(
      "ℹ️ --skip-build flag detected: Jitsi Meet build will be skipped."
    );
  }
  if (isDevMode) {
    console.log("ℹ️ --dev flag detected: Wrangler will run in dev mode.");
  }

  // Ensure we're in the sonacove directory to prevent accidents
  if (path.basename(sonaPath) !== "sonacove") {
    console.error(
      "❌ Error: Script must be run from within the sonacove directory"
    );
    console.error(`Current directory: ${sonaPath}`);
    process.exit(1);
  }

  try {
    console.log("📦 Starting deployment process...");

    const hasWrangler = await commandExists("wrangler");
    if (!hasWrangler) {
      console.log(
        "\n📦 Wrangler not found, attempting to install it globally..."
      );
      await runCommand("npm install -g wrangler");
      // Verify installation
      if (!(await commandExists("wrangler"))) {
        console.error(
          "❌ Wrangler installation failed. Please install it manually and try again."
        );
        process.exit(1);
      }
      console.log("✅ Wrangler installed successfully.");
    } else {
      console.log("\n✅ Wrangler is already installed.");
    }

    // Ensure cf-build directory exists
    ensureDirectoryExists(cfBuildDir);

    console.log("\n🧹 Step 1: Cleaning build folder selectively");
    const itemsInCfBuild = fs.readdirSync(cfBuildDir);
    const preservedFiles: string[] = [];
    for (const item of itemsInCfBuild) {
      if (!preservedFiles.includes(item)) {
        const itemPath = path.join(cfBuildDir, item);
        fs.rmSync(itemPath, { recursive: true, force: true });
        console.log(`🗑️ Removed: ${itemPath}`);
      }
    }

    console.log("\n🛠️ Step 2: Building Astro app (sonacove)");
    await runCommand("npm run build", sonaPath);

    console.log("\n📂 Step 3: Copying Astro build output to cf-build");
    copyFileOrDirectory(path.join(sonaPath, "dist"), cfBuildDir); // Copies content of dist into cfBuildDir

    // Update the copied wrangler.jsonc with the correct environment variables
    await updateWranglerConfig(cfBuildDir, sonaPath);

    console.log("\n📂 Step 4: Copying functions folder");
    const functionsSourceDir = path.join(sonaPath, "functions");
    const functionsTargetDir = path.join(cfBuildDir, "functions");
    if (fs.existsSync(functionsSourceDir)) {
      copyFileOrDirectory(functionsSourceDir, functionsTargetDir);
      // await buildFunctions(functionsTargetDir);
    } else {
      console.warn(
        `⚠️ Functions source directory not found: ${functionsSourceDir}, skipping.`
      );
    }

    console.log("\n🛠️ Step 5: Building Jitsi-meet (make all)");
    if (skipJitsiBuild) {
      console.log("⏭️ Skipping Jitsi-meet build as per --skip-build flag.");
    } else {
      await runCommand("make all", projectRootDir); // Run make from the project's root directory
    }

    console.log("\n📂 Step 6: Copying Jitsi-meet files to cf-build/meet");
    ensureDirectoryExists(meetDir);
    const individualFiles = [
      "base.html",
      "body.html",
      "conference.js",
      "config.js",
      "fonts.html",
      "head.html",
      "index.html",
      "interface_config.js",
      "plugin.head.html",
      "title.html",
      "css/all.css",
      "manifest.json",
      "pwa-worker.js",
    ];
    for (const file of individualFiles) {
      const srcPath = path.join(projectRootDir, file); // Source from project root
      const destPath = path.join(meetDir, file);
      if (fs.existsSync(srcPath)) {
        ensureDirectoryExists(path.dirname(destPath));
        fs.copyFileSync(srcPath, destPath); // Use fs.copyFileSync for direct file copy, logged by copyFileOrDirectory if called at top level
        console.log(`📋 Copied file: ${srcPath} -> ${destPath}`); // Explicit log for these specific files
      } else {
        console.warn(`⚠️ File not found, skipped: ${srcPath}`);
      }
    }

    const directoriesToCopy = [
      "fonts",
      "lang",
      "images",
      "libs",
      "sounds",
      "static",
    ];
    for (const dir of directoriesToCopy) {
      const srcPath = path.join(projectRootDir, dir); // Source from project root
      const destPath = path.join(meetDir, dir);
      if (fs.existsSync(srcPath)) {
        copyFileOrDirectory(srcPath, destPath); // This will log one message for the directory
      } else {
        console.warn(`⚠️ Directory not found, skipped: ${srcPath}`);
      }
    }

    // updateBaseHref(meetDir);
    if (fs.existsSync(path.join(meetDir, "static/404.html"))) {
      fs.copyFileSync(
        path.join(meetDir, "static/404.html"),
        path.join(meetDir, "404.html")
      );
    }

    console.log("\n🔄 Step 7: Processing SSI in HTML files (in cf-build/meet)");
    processDirectoryForSSI(meetDir, meetDir); // meetDir is the root for absolute SSI paths

    console.log(
      `\n🚀 Step 8: Deploying with Wrangler${isDevMode ? " (dev mode)" : ""}`
    );
    const wranglerCommand = isDevMode
      ? "wrangler pages dev"
      : "wrangler pages deploy";
    await runCommand(wranglerCommand, cfBuildDir); // Run wrangler from cf-build

    console.log("\n✅ Deployment completed successfully!");
  } catch (error) {
    console.error("\n❌ Deployment failed:");
    console.error(error); // error might already be an Error object
    process.exit(1);
  }
}

deploy().catch((err) => {
  // This catch is mostly for unexpected errors in deploy() promise chain
  console.error("❌ Unhandled error during deployment script execution:");
  console.error(err);
  process.exit(1);
});
