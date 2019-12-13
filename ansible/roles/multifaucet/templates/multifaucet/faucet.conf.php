<?php
// Modify these settings to suit your needs.
$config = array(
        "mysql_table_prefix" => getenv("MULTIFAUCET_DB_PRFX"), // table prefix to use

        "minimum_payout" => getenv("MULTIFAUCET_MIN_PAYOUT"), //1000, // minimum to be awarded
        "maximum_payout" => getenv("MULTIFAUCET_MAX_PAYOUT"), //1000, // maximum to be awarded
        "payout_threshold" => getenv("MULTIFAUCET_PAYOUT_THRESHOLD"), //1000, // payout threshold, if the faucet contains less than this, display the 'dry_faucet' message
        "payout_interval" => getenv("MULTIFAUCET_PAYOUT_INTERVAL"), //"1m", // payout interval, the wait time for a user between payouts. Type any numerical value with either a "m" (minutes), "h" (hours), or "d" (days), attached. Examples: 50m for a 50 minute delay, 7h for a 7 hour delay, etc.

        // this option has 3 possible values: "ip_address", "wallet_address", and "both". It defines what to check for when a user enters an address in order to decide whether or not to award to this user.
        // "ip_address": checks the user IP address in the payout history.
        // "wallet_address": checks the wallet address in the payout history.
        // "both": check both the IP and wallet address in the payout history.
        "user_check" => "both",

        "use_captcha" => true, // require the user to enter a captcha
        "use_spammerslapper" => false, // Prevent The use of Proxies and check the IP against Blacklists

        "captcha" => "simple-captcha", // which CAPTCHA to use, possible values are: "recaptcha", "solvemedia", and "simple-captcha".

        "captcha_config" => array(
                //Simple Captcha Session Name
                "simple_captcha_session_name" => "multifaucet",
                // if you're using reCAPTCHA, enter your private and public keys here:
                "recpatcha_private_key" => "PRIVATE_KEY_HERE",
                "recpatcha_public_key" => "PUBLIC_KEY_HERE",
                // if you're using Solve MEDIA, enter your private, challenge, and hash keys here:
                "solvemedia_private_key" => "PRIVATE_KEY_HERE",
                "solvemedia_challenge_key" => "CHALLENGE_KEY_HERE",
                "solvemedia_hash_key" => "HASH_KEY_HERE",
        ),

        "spammerslapper_key" => "", // SpammerSlapper API key.

        // promo codes:
        "use_promo_codes" => false, // accept promo codes

        // Donation address:
        "donation_address" => getenv("MULTIFAUCET_DONATION_ADDRESS"), // donation address to display

        // Faucet look and feel:
        "title" => "Dash Faucet", // page title, may be used by the template too
        "sitename" => "Dash Faucet", // page title, may be used by the template too
        "sitedesc" => "Dash", // page title, may be used by the template too
        "coin_code" => "DASH",
        "template" => "default", // template to use (see the templates directory)
        "lang" => "en",
);
