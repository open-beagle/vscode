/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'Contributes extension defined themable colors',
	'The identifier of the themable color',
	'Identifiers must only contain letters, digits and dots and can not start with a dot',
	'The description of the themable color',
	'The default color for light themes. Either a color value in hex (#RRGGBB[AA]) or the identifier of a themable color which provides the default.',
	'The default color for dark themes. Either a color value in hex (#RRGGBB[AA]) or the identifier of a themable color which provides the default.',
	'The default color for high contrast themes. Either a color value in hex (#RRGGBB[AA]) or the identifier of a themable color which provides the default.',
	"'configuration.colors' must be a array",
	"{0} must be either a color value in hex (#RRGGBB[AA] or #RGB[A]) or the identifier of a themable color which provides the default.",
	"'configuration.colors.id' must be defined and can not be empty",
	"'configuration.colors.id' must only contain letters, digits and dots and can not start with a dot",
	"'configuration.colors.description' must be defined and can not be empty",
	"'configuration.colors.defaults' must be defined and must contain 'light', 'dark' and 'highContrast'"
]);