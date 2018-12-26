<?php
/**
 * Plugin Name: Advanced Blocks
 * Plugin URI: http://devgutenberg.local/
 * Description: Advanced Blocks for Gutenberg
 * Author: TruongTuyen
 * Author URI: http://devgutenberg.local/about
 * Version: 1.0.0
 * License: GPL2+
 * License URI: https://www.gnu.org/licenses/gpl-2.0.txt
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Block Initializer.
 */
require_once plugin_dir_path( __FILE__ ) . 'src/init.php';
