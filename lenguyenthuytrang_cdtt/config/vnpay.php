<?php

return [

    'tmn_code' => env('VNPAY_TMN_CODE'),

    'hash_secret' => env('VNPAY_HASH_SECRET'),

    'url' => env('VNPAY_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'),

    'return_url' => env('VNPAY_RETURN_URL'),

    'ipn_url' => env('VNPAY_IPN_URL'),

    'version' => env('VNPAY_VERSION', '2.1.0'),

    'locale' => env('VNPAY_LOCALE', 'vn'),

    'currency' => env('VNPAY_CURRENCY', 'VND'),

    'frontend_url' => env('FRONTEND_URL', 'http://localhost:3000'),

];
