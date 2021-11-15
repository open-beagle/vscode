/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/editor/contrib/symbolIcons/symbolIcons", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/base/common/codicons"], function (require, exports, nls_1, themeService_1, colorRegistry_1, codicons_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SYMBOL_ICON_VARIABLE_FOREGROUND = exports.SYMBOL_ICON_UNIT_FOREGROUND = exports.SYMBOL_ICON_TYPEPARAMETER_FOREGROUND = exports.SYMBOL_ICON_TEXT_FOREGROUND = exports.SYMBOL_ICON_STRUCT_FOREGROUND = exports.SYMBOL_ICON_STRING_FOREGROUND = exports.SYMBOL_ICON_SNIPPET_FOREGROUND = exports.SYMBOL_ICON_REFERENCE_FOREGROUND = exports.SYMBOL_ICON_PROPERTY_FOREGROUND = exports.SYMBOL_ICON_PACKAGE_FOREGROUND = exports.SYMBOL_ICON_OPERATOR_FOREGROUND = exports.SYMBOL_ICON_OBJECT_FOREGROUND = exports.SYMBOL_ICON_NUMBER_FOREGROUND = exports.SYMBOL_ICON_NULL_FOREGROUND = exports.SYMBOL_ICON_NAMESPACE_FOREGROUND = exports.SYMBOL_ICON_MODULE_FOREGROUND = exports.SYMBOL_ICON_METHOD_FOREGROUND = exports.SYMBOL_ICON_KEYWORD_FOREGROUND = exports.SYMBOL_ICON_KEY_FOREGROUND = exports.SYMBOL_ICON_INTERFACE_FOREGROUND = exports.SYMBOL_ICON_FUNCTION_FOREGROUND = exports.SYMBOL_ICON_FOLDER_FOREGROUND = exports.SYMBOL_ICON_FILE_FOREGROUND = exports.SYMBOL_ICON_FIELD_FOREGROUND = exports.SYMBOL_ICON_EVENT_FOREGROUND = exports.SYMBOL_ICON_ENUMERATOR_MEMBER_FOREGROUND = exports.SYMBOL_ICON_ENUMERATOR_FOREGROUND = exports.SYMBOL_ICON_CONSTRUCTOR_FOREGROUND = exports.SYMBOL_ICON_CONSTANT_FOREGROUND = exports.SYMBOL_ICON_COLOR_FOREGROUND = exports.SYMBOL_ICON_CLASS_FOREGROUND = exports.SYMBOL_ICON_BOOLEAN_FOREGROUND = exports.SYMBOL_ICON_ARRAY_FOREGROUND = void 0;
    exports.SYMBOL_ICON_ARRAY_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.arrayForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hc: colorRegistry_1.foreground
    }, (0, nls_1.localize)(0, null));
    exports.SYMBOL_ICON_BOOLEAN_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.booleanForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hc: colorRegistry_1.foreground
    }, (0, nls_1.localize)(1, null));
    exports.SYMBOL_ICON_CLASS_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.classForeground', {
        dark: '#EE9D28',
        light: '#D67E00',
        hc: '#EE9D28'
    }, (0, nls_1.localize)(2, null));
    exports.SYMBOL_ICON_COLOR_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.colorForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hc: colorRegistry_1.foreground
    }, (0, nls_1.localize)(3, null));
    exports.SYMBOL_ICON_CONSTANT_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.constantForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hc: colorRegistry_1.foreground
    }, (0, nls_1.localize)(4, null));
    exports.SYMBOL_ICON_CONSTRUCTOR_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.constructorForeground', {
        dark: '#B180D7',
        light: '#652D90',
        hc: '#B180D7'
    }, (0, nls_1.localize)(5, null));
    exports.SYMBOL_ICON_ENUMERATOR_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.enumeratorForeground', {
        dark: '#EE9D28',
        light: '#D67E00',
        hc: '#EE9D28'
    }, (0, nls_1.localize)(6, null));
    exports.SYMBOL_ICON_ENUMERATOR_MEMBER_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.enumeratorMemberForeground', {
        dark: '#75BEFF',
        light: '#007ACC',
        hc: '#75BEFF'
    }, (0, nls_1.localize)(7, null));
    exports.SYMBOL_ICON_EVENT_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.eventForeground', {
        dark: '#EE9D28',
        light: '#D67E00',
        hc: '#EE9D28'
    }, (0, nls_1.localize)(8, null));
    exports.SYMBOL_ICON_FIELD_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.fieldForeground', {
        dark: '#75BEFF',
        light: '#007ACC',
        hc: '#75BEFF'
    }, (0, nls_1.localize)(9, null));
    exports.SYMBOL_ICON_FILE_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.fileForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hc: colorRegistry_1.foreground
    }, (0, nls_1.localize)(10, null));
    exports.SYMBOL_ICON_FOLDER_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.folderForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hc: colorRegistry_1.foreground
    }, (0, nls_1.localize)(11, null));
    exports.SYMBOL_ICON_FUNCTION_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.functionForeground', {
        dark: '#B180D7',
        light: '#652D90',
        hc: '#B180D7'
    }, (0, nls_1.localize)(12, null));
    exports.SYMBOL_ICON_INTERFACE_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.interfaceForeground', {
        dark: '#75BEFF',
        light: '#007ACC',
        hc: '#75BEFF'
    }, (0, nls_1.localize)(13, null));
    exports.SYMBOL_ICON_KEY_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.keyForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hc: colorRegistry_1.foreground
    }, (0, nls_1.localize)(14, null));
    exports.SYMBOL_ICON_KEYWORD_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.keywordForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hc: colorRegistry_1.foreground
    }, (0, nls_1.localize)(15, null));
    exports.SYMBOL_ICON_METHOD_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.methodForeground', {
        dark: '#B180D7',
        light: '#652D90',
        hc: '#B180D7'
    }, (0, nls_1.localize)(16, null));
    exports.SYMBOL_ICON_MODULE_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.moduleForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hc: colorRegistry_1.foreground
    }, (0, nls_1.localize)(17, null));
    exports.SYMBOL_ICON_NAMESPACE_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.namespaceForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hc: colorRegistry_1.foreground
    }, (0, nls_1.localize)(18, null));
    exports.SYMBOL_ICON_NULL_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.nullForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hc: colorRegistry_1.foreground
    }, (0, nls_1.localize)(19, null));
    exports.SYMBOL_ICON_NUMBER_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.numberForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hc: colorRegistry_1.foreground
    }, (0, nls_1.localize)(20, null));
    exports.SYMBOL_ICON_OBJECT_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.objectForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hc: colorRegistry_1.foreground
    }, (0, nls_1.localize)(21, null));
    exports.SYMBOL_ICON_OPERATOR_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.operatorForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hc: colorRegistry_1.foreground
    }, (0, nls_1.localize)(22, null));
    exports.SYMBOL_ICON_PACKAGE_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.packageForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hc: colorRegistry_1.foreground
    }, (0, nls_1.localize)(23, null));
    exports.SYMBOL_ICON_PROPERTY_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.propertyForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hc: colorRegistry_1.foreground
    }, (0, nls_1.localize)(24, null));
    exports.SYMBOL_ICON_REFERENCE_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.referenceForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hc: colorRegistry_1.foreground
    }, (0, nls_1.localize)(25, null));
    exports.SYMBOL_ICON_SNIPPET_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.snippetForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hc: colorRegistry_1.foreground
    }, (0, nls_1.localize)(26, null));
    exports.SYMBOL_ICON_STRING_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.stringForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hc: colorRegistry_1.foreground
    }, (0, nls_1.localize)(27, null));
    exports.SYMBOL_ICON_STRUCT_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.structForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hc: colorRegistry_1.foreground
    }, (0, nls_1.localize)(28, null));
    exports.SYMBOL_ICON_TEXT_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.textForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hc: colorRegistry_1.foreground
    }, (0, nls_1.localize)(29, null));
    exports.SYMBOL_ICON_TYPEPARAMETER_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.typeParameterForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hc: colorRegistry_1.foreground
    }, (0, nls_1.localize)(30, null));
    exports.SYMBOL_ICON_UNIT_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.unitForeground', {
        dark: colorRegistry_1.foreground,
        light: colorRegistry_1.foreground,
        hc: colorRegistry_1.foreground
    }, (0, nls_1.localize)(31, null));
    exports.SYMBOL_ICON_VARIABLE_FOREGROUND = (0, colorRegistry_1.registerColor)('symbolIcon.variableForeground', {
        dark: '#75BEFF',
        light: '#007ACC',
        hc: '#75BEFF'
    }, (0, nls_1.localize)(32, null));
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const symbolIconArrayColor = theme.getColor(exports.SYMBOL_ICON_ARRAY_FOREGROUND);
        if (symbolIconArrayColor) {
            collector.addRule(`${codicons_1.Codicon.symbolArray.cssSelector} { color: ${symbolIconArrayColor}; }`);
        }
        const symbolIconBooleanColor = theme.getColor(exports.SYMBOL_ICON_BOOLEAN_FOREGROUND);
        if (symbolIconBooleanColor) {
            collector.addRule(`${codicons_1.Codicon.symbolBoolean.cssSelector} { color: ${symbolIconBooleanColor}; }`);
        }
        const symbolIconClassColor = theme.getColor(exports.SYMBOL_ICON_CLASS_FOREGROUND);
        if (symbolIconClassColor) {
            collector.addRule(`${codicons_1.Codicon.symbolClass.cssSelector} { color: ${symbolIconClassColor}; }`);
        }
        const symbolIconMethodColor = theme.getColor(exports.SYMBOL_ICON_METHOD_FOREGROUND);
        if (symbolIconMethodColor) {
            collector.addRule(`${codicons_1.Codicon.symbolMethod.cssSelector} { color: ${symbolIconMethodColor}; }`);
        }
        const symbolIconColorColor = theme.getColor(exports.SYMBOL_ICON_COLOR_FOREGROUND);
        if (symbolIconColorColor) {
            collector.addRule(`${codicons_1.Codicon.symbolColor.cssSelector} { color: ${symbolIconColorColor}; }`);
        }
        const symbolIconConstantColor = theme.getColor(exports.SYMBOL_ICON_CONSTANT_FOREGROUND);
        if (symbolIconConstantColor) {
            collector.addRule(`${codicons_1.Codicon.symbolConstant.cssSelector} { color: ${symbolIconConstantColor}; }`);
        }
        const symbolIconConstructorColor = theme.getColor(exports.SYMBOL_ICON_CONSTRUCTOR_FOREGROUND);
        if (symbolIconConstructorColor) {
            collector.addRule(`${codicons_1.Codicon.symbolConstructor.cssSelector} { color: ${symbolIconConstructorColor}; }`);
        }
        const symbolIconEnumeratorColor = theme.getColor(exports.SYMBOL_ICON_ENUMERATOR_FOREGROUND);
        if (symbolIconEnumeratorColor) {
            collector.addRule(`
			${codicons_1.Codicon.symbolValue.cssSelector},${codicons_1.Codicon.symbolEnum.cssSelector} { color: ${symbolIconEnumeratorColor}; }`);
        }
        const symbolIconEnumeratorMemberColor = theme.getColor(exports.SYMBOL_ICON_ENUMERATOR_MEMBER_FOREGROUND);
        if (symbolIconEnumeratorMemberColor) {
            collector.addRule(`${codicons_1.Codicon.symbolEnumMember.cssSelector} { color: ${symbolIconEnumeratorMemberColor}; }`);
        }
        const symbolIconEventColor = theme.getColor(exports.SYMBOL_ICON_EVENT_FOREGROUND);
        if (symbolIconEventColor) {
            collector.addRule(`${codicons_1.Codicon.symbolEvent.cssSelector} { color: ${symbolIconEventColor}; }`);
        }
        const symbolIconFieldColor = theme.getColor(exports.SYMBOL_ICON_FIELD_FOREGROUND);
        if (symbolIconFieldColor) {
            collector.addRule(`${codicons_1.Codicon.symbolField.cssSelector} { color: ${symbolIconFieldColor}; }`);
        }
        const symbolIconFileColor = theme.getColor(exports.SYMBOL_ICON_FILE_FOREGROUND);
        if (symbolIconFileColor) {
            collector.addRule(`${codicons_1.Codicon.symbolFile.cssSelector} { color: ${symbolIconFileColor}; }`);
        }
        const symbolIconFolderColor = theme.getColor(exports.SYMBOL_ICON_FOLDER_FOREGROUND);
        if (symbolIconFolderColor) {
            collector.addRule(`${codicons_1.Codicon.symbolFolder.cssSelector} { color: ${symbolIconFolderColor}; }`);
        }
        const symbolIconFunctionColor = theme.getColor(exports.SYMBOL_ICON_FUNCTION_FOREGROUND);
        if (symbolIconFunctionColor) {
            collector.addRule(`${codicons_1.Codicon.symbolFunction.cssSelector} { color: ${symbolIconFunctionColor}; }`);
        }
        const symbolIconInterfaceColor = theme.getColor(exports.SYMBOL_ICON_INTERFACE_FOREGROUND);
        if (symbolIconInterfaceColor) {
            collector.addRule(`${codicons_1.Codicon.symbolInterface.cssSelector} { color: ${symbolIconInterfaceColor}; }`);
        }
        const symbolIconKeyColor = theme.getColor(exports.SYMBOL_ICON_KEY_FOREGROUND);
        if (symbolIconKeyColor) {
            collector.addRule(`${codicons_1.Codicon.symbolKey.cssSelector} { color: ${symbolIconKeyColor}; }`);
        }
        const symbolIconKeywordColor = theme.getColor(exports.SYMBOL_ICON_KEYWORD_FOREGROUND);
        if (symbolIconKeywordColor) {
            collector.addRule(`${codicons_1.Codicon.symbolKeyword.cssSelector} { color: ${symbolIconKeywordColor}; }`);
        }
        const symbolIconModuleColor = theme.getColor(exports.SYMBOL_ICON_MODULE_FOREGROUND);
        if (symbolIconModuleColor) {
            collector.addRule(`${codicons_1.Codicon.symbolModule.cssSelector} { color: ${symbolIconModuleColor}; }`);
        }
        const outlineNamespaceColor = theme.getColor(exports.SYMBOL_ICON_NAMESPACE_FOREGROUND);
        if (outlineNamespaceColor) {
            collector.addRule(`${codicons_1.Codicon.symbolNamespace.cssSelector} { color: ${outlineNamespaceColor}; }`);
        }
        const symbolIconNullColor = theme.getColor(exports.SYMBOL_ICON_NULL_FOREGROUND);
        if (symbolIconNullColor) {
            collector.addRule(`${codicons_1.Codicon.symbolNull.cssSelector} { color: ${symbolIconNullColor}; }`);
        }
        const symbolIconNumberColor = theme.getColor(exports.SYMBOL_ICON_NUMBER_FOREGROUND);
        if (symbolIconNumberColor) {
            collector.addRule(`${codicons_1.Codicon.symbolNumber.cssSelector} { color: ${symbolIconNumberColor}; }`);
        }
        const symbolIconObjectColor = theme.getColor(exports.SYMBOL_ICON_OBJECT_FOREGROUND);
        if (symbolIconObjectColor) {
            collector.addRule(`${codicons_1.Codicon.symbolObject.cssSelector} { color: ${symbolIconObjectColor}; }`);
        }
        const symbolIconOperatorColor = theme.getColor(exports.SYMBOL_ICON_OPERATOR_FOREGROUND);
        if (symbolIconOperatorColor) {
            collector.addRule(`${codicons_1.Codicon.symbolOperator.cssSelector} { color: ${symbolIconOperatorColor}; }`);
        }
        const symbolIconPackageColor = theme.getColor(exports.SYMBOL_ICON_PACKAGE_FOREGROUND);
        if (symbolIconPackageColor) {
            collector.addRule(`${codicons_1.Codicon.symbolPackage.cssSelector} { color: ${symbolIconPackageColor}; }`);
        }
        const symbolIconPropertyColor = theme.getColor(exports.SYMBOL_ICON_PROPERTY_FOREGROUND);
        if (symbolIconPropertyColor) {
            collector.addRule(`${codicons_1.Codicon.symbolProperty.cssSelector} { color: ${symbolIconPropertyColor}; }`);
        }
        const symbolIconReferenceColor = theme.getColor(exports.SYMBOL_ICON_REFERENCE_FOREGROUND);
        if (symbolIconReferenceColor) {
            collector.addRule(`${codicons_1.Codicon.symbolReference.cssSelector} { color: ${symbolIconReferenceColor}; }`);
        }
        const symbolIconSnippetColor = theme.getColor(exports.SYMBOL_ICON_SNIPPET_FOREGROUND);
        if (symbolIconSnippetColor) {
            collector.addRule(`${codicons_1.Codicon.symbolSnippet.cssSelector} { color: ${symbolIconSnippetColor}; }`);
        }
        const symbolIconStringColor = theme.getColor(exports.SYMBOL_ICON_STRING_FOREGROUND);
        if (symbolIconStringColor) {
            collector.addRule(`${codicons_1.Codicon.symbolString.cssSelector} { color: ${symbolIconStringColor}; }`);
        }
        const symbolIconStructColor = theme.getColor(exports.SYMBOL_ICON_STRUCT_FOREGROUND);
        if (symbolIconStructColor) {
            collector.addRule(`${codicons_1.Codicon.symbolStruct.cssSelector} { color: ${symbolIconStructColor}; }`);
        }
        const symbolIconTextColor = theme.getColor(exports.SYMBOL_ICON_TEXT_FOREGROUND);
        if (symbolIconTextColor) {
            collector.addRule(`${codicons_1.Codicon.symbolText.cssSelector} { color: ${symbolIconTextColor}; }`);
        }
        const symbolIconTypeParameterColor = theme.getColor(exports.SYMBOL_ICON_TYPEPARAMETER_FOREGROUND);
        if (symbolIconTypeParameterColor) {
            collector.addRule(`${codicons_1.Codicon.symbolTypeParameter.cssSelector} { color: ${symbolIconTypeParameterColor}; }`);
        }
        const symbolIconUnitColor = theme.getColor(exports.SYMBOL_ICON_UNIT_FOREGROUND);
        if (symbolIconUnitColor) {
            collector.addRule(`${codicons_1.Codicon.symbolUnit.cssSelector} { color: ${symbolIconUnitColor}; }`);
        }
        const symbolIconVariableColor = theme.getColor(exports.SYMBOL_ICON_VARIABLE_FOREGROUND);
        if (symbolIconVariableColor) {
            collector.addRule(`${codicons_1.Codicon.symbolVariable.cssSelector} { color: ${symbolIconVariableColor}; }`);
        }
    });
});
//# sourceMappingURL=symbolIcons.js.map