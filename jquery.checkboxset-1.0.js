/**
 * jQuery CheckboxSet plugin
 *
 * This document is licensed as free software under the terms of the
 * MIT License: http://www.opensource.org/licenses/mit-license.php
 *
 * @author      Cheton Wu
 * @version     $Id: jquery.checkboxset.js 2010-12-03 cheton@gmail.com $
 */

(function($) {

    $.fn.checkboxset = function(options) {
        var defaults = {
            tristate : true,
            data : {},
            change : function(name) { }
        };
        options.tristate = isset(options.tristate) ? options.tristate : defaults.tristate;
        options.data = options.data || defaults.data;
        options.change = options.change || defaults.change;

        var config = {
            selector : $(this),
            tristate : options.tristate,
            data : options.data,
            change : options.change
        };

        /**
         * Public Methods
         */

        /**
         * Returns the checked status with the given name
         */
        this.checked = function(name) {
            return config.selector.find("input[name='" + name + "']").attr("checked");
        }

        /**
         * Returns the indeterminate status with the given name
         */
        this.indeterminate = function(name) {
            return config.selector.find("input[name='" + name + "']").attr("indeterminate");
        }

        __init__(config, config.data, "");

        return this;
    }

    /**
     * Private Methods
     */

    __init__ = function(config, obj, prefix) {
       for (var key in obj) {
           var checked = false;
           var val = obj[key];
           if (isset(val.checked)) {
               config.selector.find("input[name='" + key + "']").attr("checked", val.checked);
               delete val.checked;
           }
           if ( ! empty(val)) {
               __init__(config, val, empty(prefix) ? key : prefix + "." + key);
           }
           config.selector.find("input[name='" + key + "']").bind(
               "click", { prefix : prefix, name : key, descendants : val },
               function(e) {
                   var checked = $(this).attr("checked");
                   traverse_descendants(config, e.data.descendants, checked);
                   traverse_ancestors(config, e.data.prefix);
                   config.change(e.data.name); // change callback
               }
           );
       }
       traverse_ancestors(config, prefix);
    }

    traverse_descendants = function(config, objs, checked) {
        for (var key in objs) {
            var val = objs[key];
            if ( ! empty(val)) {
                traverse_descendants(config, val, checked);
            }
            config.selector.find("input[name='" + key + "']").attr("checked", checked);
            if (config.tristate) {
                config.selector.find("input[name='" + key + "']").attr("indeterminate", false);
            }
        }
    }

    traverse_ancestors = function(config, prefix) {
        if (empty(prefix))
            return;
        var arr = prefix.split(".");
        var obj = config.data;
        for (var i = 0; i < arr.length; i++) {
            obj = obj[arr[i]];
            if ( ! isset(obj))
                break; // skip undefined or null object
        }
        var count = 0, checked = 0, indeterminate = 0;
        for (var name in obj) {
            if (config.selector.find("input[name='" + name + "']").attr("checked")) {
                ++checked;
            }
            if (config.selector.find("input[name='" + name + "']").attr("indeterminate")) {
                ++indeterminate;
            }
            ++count;
        }
        var name = arr.pop();
        config.selector.find("input[name='" + name + "']").attr("checked", checked > 0);
        if (config.tristate) {
            config.selector.find("input[name='" + name + "']").attr("indeterminate", (checked > 0 && count != checked) || (indeterminate > 0));
        }
        traverse_ancestors(config, arr.join("."));
    }

    function isset(mixed_var) {
        return (mixed_var != null) && (mixed_var != undefined);
    }

    function empty(mixed_var) {
        if (mixed_var === "" || mixed_var === 0 || mixed_var === "0" || mixed_var === null || mixed_var === false ||  typeof mixed_var === 'undefined') {
            return true;
        }

        if ( ! mixed_var) {
            return true;
        }
        if (typeof mixed_var == 'object') {
            for (var key in mixed_var) {
                return false;
            }
            return true;
        }
        return false;
    }

})(jQuery);
