/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'Contributes extension defined themable icons',
	'The identifier of the themable icon',
	'Identifiers can only contain letters, digits and minuses and need to consist of at least two segments in the form `component-iconname`.',
	'The description of the themable icon',
	'The id of the icon font that defines the icon.',
	'The character for the icon in the icon font.',
	'The default of the icon. Either a reference to an extisting ThemeIcon or an icon in an icon font.',
	'Contributes icon fonts to be used by icon contributions.',
	'The ID of the font.',
	'The ID must only contain letters, numbers, underscore and minus.',
	'The location of the font.',
	'The font path, relative to the current extension location.',
	'The format of the font.',
	"'configuration.icons is a proposed contribution point and only available when running out of dev or with the following command line switch: --enable-proposed-api {0}",
	"'configuration.icons' must be a array",
	"'configuration.icons.id' must be defined and can not be empty",
	"'configuration.icons.id' can only contain letter, digits and minuses and need to consist of at least two segments in the form `component-iconname`.",
	"'configuration.icons.description' must be defined and can not be empty",
	"'configuration.icons.default' must be either a reference to the id of an other theme icon (string) or a icon definition (object) with properties `fontId` and `fontCharacter`.",
	"'configuration.iconFonts is a proposed contribution point and only available when running out of dev or with the following command line switch: --enable-proposed-api {0}",
	"'configuration.iconFonts' must be a array",
	"'configuration.iconFonts.id' must be defined and can not be empty",
	"'configuration.iconFonts.id'  must only contain letters, numbers, underscore and minus.",
	"'configuration.iconFonts.src' must be an array with locations of the icon font.",
	"Expected `contributes.iconFonts.src.path` ({0}) to be included inside extension's folder ({0}). This might make the extension non-portable.",
	"Items of 'configuration.iconFonts.src' must be objects with properties 'path' and 'format'"
]);