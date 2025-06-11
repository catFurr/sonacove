<template>
  <div style="display: none;"></div>
</template>

<script setup>
import { onMounted } from 'vue'
import { initializePaddle } from '@paddle/paddle-js'

const env = import.meta.env

function floorPrice(formattedPrice) {
  const numeric = parseFloat(formattedPrice.replace(/[^0-9.]/g, ""))
  const currencySymbol = formattedPrice.trim().charAt(0)
  return {
    numeric,
    currencySymbol,
    formatted: `${currencySymbol}${Math.floor(numeric * 10) / 10}`
  }
}

function applyDiscount(price, discountPercent) {
  return price - (price * discountPercent)
}

onMounted(async () => {
  try {
    const environment = env.PUBLIC_PADDLE_ENVIRONMENT || 'sandbox'
    const clientToken = env.PUBLIC_PADDLE_CLIENT_TOKEN

    if (!clientToken) {
      console.error('Missing Paddle client token')
      return
    }

    const paddle = await initializePaddle({
      environment,
      token: clientToken
    })

    const result = await paddle.PricePreview({
      items: [
        { priceId: env.PUBLIC_PADDLE_PREMIUM_PRICE_ID, quantity: 1 },
        { priceId: env.PUBLIC_PADDLE_ORGANIZATION_PRICE_ID, quantity: 1 }
      ]
    })

    const prices = result.data.details.lineItems

    const premiumData = floorPrice(prices[0].formattedUnitTotals.total)
    const orgData = floorPrice(prices[1].formattedUnitTotals.total)
    const freeData = {
      numeric: 0,
      currencySymbol: premiumData.currencySymbol,
      formatted: `${premiumData.currencySymbol}0`
    }

    const premiumDiscount = Number(prices[0].price.customData?.discount) || 0
    const orgDiscount = Number(prices[1].price.customData?.discount) || 0

    const premiumDiscounted = applyDiscount(premiumData.numeric, premiumDiscount)
    const orgDiscounted = applyDiscount(orgData.numeric, orgDiscount)

    const premiumDiscountedFormatted = `${premiumData.currencySymbol}${premiumDiscounted.toFixed(1)}`
    const orgDiscountedFormatted = `${orgData.currencySymbol}${orgDiscounted.toFixed(1)}`

    window.plans = {
      "Free Plan": {
        price: freeData.formatted,
        priceWithDiscount: null
      },
      "Premium Plan": {
        price: premiumData.formatted,
        discount: premiumDiscount,
        priceWithDiscount: premiumDiscount > 0 ? premiumDiscountedFormatted : null
      },
      "Organization Plan": {
        price: orgData.formatted,
        discount: orgDiscount,
        priceWithDiscount: orgDiscount > 0 ? orgDiscountedFormatted : null
      }
    }

    for (const planTitle in window.plans) {
      const data = window.plans[planTitle]

      document.querySelectorAll(`[data-plan="${planTitle}"] .plan-price`)
        .forEach(el => el.textContent = data.priceWithDiscount ?? data.price)

      document.querySelectorAll(`[data-plan="${planTitle}"] .discount-badge`)
        .forEach(el => {
          if (data.discount > 0) {
            el.style.display = 'block'
            el.textContent = `${data.discount * 100}% OFF`
          }
        })
    }
  } catch (err) {
    console.error('Error initializing Paddle or fetching prices:', err)
  }
})
</script>
