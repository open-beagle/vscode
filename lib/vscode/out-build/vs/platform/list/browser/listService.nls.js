/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	"Workbench",
	"Maps to `Control` on Windows and Linux and to `Command` on macOS.",
	"Maps to `Alt` on Windows and Linux and to `Option` on macOS.",
	"The modifier to be used to add an item in trees and lists to a multi-selection with the mouse (for example in the explorer, open editors and scm view). The 'Open to Side' mouse gestures - if supported - will adapt such that they do not conflict with the multiselect modifier.",
	"Controls how to open items in trees and lists using the mouse (if supported). Note that some trees and lists might choose to ignore this setting if it is not applicable.",
	"Controls whether lists and trees support horizontal scrolling in the workbench. Warning: turning on this setting has a performance implication.",
	"Controls tree indentation in pixels.",
	"Controls whether the tree should render indent guides.",
	"Controls whether lists and trees have smooth scrolling.",
	"Simple keyboard navigation focuses elements which match the keyboard input. Matching is done only on prefixes.",
	"Highlight keyboard navigation highlights elements which match the keyboard input. Further up and down navigation will traverse only the highlighted elements.",
	"Filter keyboard navigation will filter out and hide all the elements which do not match the keyboard input.",
	"Controls the keyboard navigation style for lists and trees in the workbench. Can be simple, highlight and filter.",
	"Controls whether keyboard navigation in lists and trees is automatically triggered simply by typing. If set to `false`, keyboard navigation is only triggered when executing the `list.toggleKeyboardNavigation` command, for which you can assign a keyboard shortcut.",
	"Controls how tree folders are expanded when clicking the folder names. Note that some trees and lists might choose to ignore this setting if it is not applicable."
]);