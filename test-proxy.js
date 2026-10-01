const express = require('express');
const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');
console.log(typeof responseInterceptor);
