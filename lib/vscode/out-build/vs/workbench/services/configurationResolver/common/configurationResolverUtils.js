define(["require", "exports", "vs/nls!vs/workbench/services/configurationResolver/common/configurationResolverUtils"], function (require, exports, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.applyDeprecatedVariableMessage = void 0;
    function applyDeprecatedVariableMessage(schema) {
        schema.pattern = schema.pattern || '^(?!.*\\$\\{(env|config|command)\\.)';
        schema.patternErrorMessage = schema.patternErrorMessage ||
            nls.localize(0, null);
    }
    exports.applyDeprecatedVariableMessage = applyDeprecatedVariableMessage;
});
//# sourceMappingURL=configurationResolverUtils.js.map