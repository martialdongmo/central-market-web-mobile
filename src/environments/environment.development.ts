import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();
const baseUrl = isNative ? 'https://kapexpert.cloud:9009' : 'http://localhost:9009';
const redirectUri = isNative ? 'cm.kapexpert.grouping://callback' : 'http://localhost:3000/callback';

export const environment = {
  production: false,
  AUTH_API_URL: baseUrl,
  USER_API_URL: `${baseUrl}/api/v1/bis/users`,
  CATALOG_API_URL: `${baseUrl}/api/v1/bis/catalog`,
  categoryEndpoint: `${baseUrl}/api/v1/bis/categories`,
  customersEndpoint: `${baseUrl}/api/v1/bis/customers`,
  orderEndpoint: `${baseUrl}/api/v1/bis/orders`,
  paymentEndpoint: `${baseUrl}/api/v1/bis/payments`,
  invoiceEndpoint: `${baseUrl}/api/v1/bis/invoices`,
  driversEndpoint: `${baseUrl}/api/v1/bis/drivers`,
  redirectUri,
  stripePublishableKey: 'pk_test_51Tts9MLv7UFWWZoLiqlHRFoeGapNgN0pF2UrTrq2VVjqDuug0iXfGTA0Ebz1C9hciOghl3Qg5g8Y0ZV0TSsA18LY00S93ZPPTJ'
};

