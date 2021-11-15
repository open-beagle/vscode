/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	"Editor",
	"The number of spaces a tab is equal to. This setting is overridden based on the file contents when `#editor.detectIndentation#` is on.",
	"Insert spaces when pressing `Tab`. This setting is overridden based on the file contents when `#editor.detectIndentation#` is on.",
	"Controls whether `#editor.tabSize#` and `#editor.insertSpaces#` will be automatically detected when a file is opened based on the file contents.",
	"Remove trailing auto inserted whitespace.",
	"Special handling for large files to disable certain memory intensive features.",
	"Controls whether completions should be computed based on words in the document.",
	'Only suggest words from the active document.',
	'Suggest words from all open documents of the same language.',
	'Suggest words from all open documents.',
	"Controls from which documents word based completions are computed.",
	'Semantic highlighting enabled for all color themes.',
	'Semantic highlighting disabled for all color themes.',
	'Semantic highlighting is configured by the current color theme\'s `semanticHighlighting` setting.',
	"Controls whether the semanticHighlighting is shown for the languages that support it.",
	"Keep peek editors open even when double clicking their content or when hitting `Escape`.",
	"Lines above this length will not be tokenized for performance reasons",
	"Timeout in milliseconds after which diff computation is cancelled. Use 0 for no timeout.",
	"Controls whether the diff editor shows the diff side by side or inline.",
	"When enabled, the diff editor ignores changes in leading or trailing whitespace.",
	"Controls whether the diff editor shows +/- indicators for added/removed changes.",
	"Controls whether the editor shows CodeLens.",
	"Lines will never wrap.",
	"Lines will wrap at the viewport width.",
	"Lines will wrap according to the `#editor.wordWrap#` setting."
]);