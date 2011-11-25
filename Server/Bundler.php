<?php

# API
function smallOpen($path, $size){
	$file = fopen($path, 'r');
	$content = fread($file, $size);
	fclose($file);
	return $content;
}

function easyWrite($path, $content){
	$file = fopen($path, 'w');
	fwrite($file, $content);
	fclose($file);
}


# Check if new version is available
#$DIR = 'https://raw.github.com/Jaliborc/Booling/master/';
$DIR = '../';
$version = smallOpen($DIR . 'version.mf', 2);

if ($version == @smallOpen('version.mf', 2))
	return;
	
	
# Copy CSS
$css = file_get_contents($DIR . 'Style/Main.css');
easyWrite('style.css', $css);
$css = '<style media="screen" type="text/css">' . $css . '</style>';


# Bundle Scripts
$BRAIN = $DIR . 'Brain/';
$Brain = file($BRAIN . 'Manifest.mf', FILE_IGNORE_NEW_LINES);
$scripts = '';

foreach($Brain as $file) {
	$scripts = $scripts . file_get_contents($BRAIN . $file);
}


# Inject Code
$scripts = '<script>' . str_replace('DEV = true;', 'DEV = false;', $scripts) . '</script>';
$html = file_get_contents($DIR . 'index.html');
$replace = array();
	
preg_match('/<BUNDLE>[\w\s<>"=\/.]+<\/BUNDLE>/', $html, $replace);
$html = str_replace('VERSION', 'Version ' . $version, $html);
$html = str_replace($replace[0], $css . $scripts, $html);


# Update Manifest
$manifest = file_get_contents($DIR . 'manifest.mf');
$manifest = str_replace('VERSION', 'Version ' . $version, $manifest);


# Save Results
easyWrite('manifest.mf', $manifest);
easyWrite('version.mf', $version);
easyWrite('index.html', $html);

?>