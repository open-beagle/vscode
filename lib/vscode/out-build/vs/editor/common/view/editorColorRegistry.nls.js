/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'Background color for the highlight of line at the cursor position.',
	'Background color for the border around the line at the cursor position.',
	'Background color of highlighted ranges, like by quick open and find features. The color must not be opaque so as not to hide underlying decorations.',
	'Background color of the border around highlighted ranges.',
	'Background color of highlighted symbol, like for go to definition or go next/previous symbol. The color must not be opaque so as not to hide underlying decorations.',
	'Background color of the border around highlighted symbols.',
	'Color of the editor cursor.',
	'The background color of the editor cursor. Allows customizing the color of a character overlapped by a block cursor.',
	'Color of whitespace characters in the editor.',
	'Color of the editor indentation guides.',
	'Color of the active editor indentation guides.',
	'Color of editor line numbers.',
	'Color of editor active line number',
	'Id is deprecated. Use \'editorLineNumber.activeForeground\' instead.',
	'Color of editor active line number',
	'Color of the editor rulers.',
	'Foreground color of editor CodeLens',
	'Background color behind matching brackets',
	'Color for matching brackets boxes',
	'Color of the overview ruler border.',
	'Background color of the editor overview ruler. Only used when the minimap is enabled and placed on the right side of the editor.',
	'Background color of the editor gutter. The gutter contains the glyph margins and the line numbers.',
	'Border color of unnecessary (unused) source code in the editor.',
	'Opacity of unnecessary (unused) source code in the editor. For example, "#000000c0" will render the code with 75% opacity. For high contrast themes, use the  \'editorUnnecessaryCode.border\' theme color to underline unnecessary code instead of fading it out.',
	'Overview ruler marker color for range highlights. The color must not be opaque so as not to hide underlying decorations.',
	'Overview ruler marker color for errors.',
	'Overview ruler marker color for warnings.',
	'Overview ruler marker color for infos.'
]);