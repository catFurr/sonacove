# Astro Starter Kit: Basics

```sh
npm create astro@latest -- --template basics
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/basics)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/basics)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/basics/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

![just-the-basics](https://github.com/withastro/astro/assets/2244813/a0a5533c-a856-4198-8470-2d67b1d7c554)

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

# Sonacove Meets Landing Page

A modern landing page for Sonacove Meets, a fast, simple, and secure online meeting platform.

## Development

This project uses [Astro](https://astro.build/) with [Tailwind CSS](https://tailwindcss.com/).

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory with the following variables:

```
BREVO_API_KEY=your_brevo_api_key_here
BREVO_LIST_ID=your_brevo_list_id_here
```

4. Start the development server:

```bash
npm run dev
# or
yarn dev
```

## Deployment to Cloudflare Pages

### Automatic Deployment (Recommended)

1. Push your code to a GitHub repository
2. Log in to the Cloudflare dashboard
3. Go to Pages > Create a project
4. Connect your GitHub account and select the repository
5. Configure the build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
6. Add environment variables:
   - `BREVO_API_KEY`: Your Brevo API key
   - `BREVO_LIST_ID`: Your Brevo list ID
7. Deploy

### Manual Deployment

1. Build the project:

```bash
npm run build
# or
yarn build
```

2. Install the Cloudflare Wrangler CLI:

```bash
npm install -g wrangler
```

3. Authenticate with Cloudflare:

```bash
wrangler login
```

4. Deploy to Cloudflare Pages:

```bash
wrangler pages publish dist
```

## Environment Variables

- `BREVO_API_KEY`: Your Brevo API key for email collection
- `BREVO_LIST_ID`: The ID of the list in Brevo where contacts should be added

## License

All rights reserved.
