(function() {
	"use strict";

	/* Enum: enumerated values.
	 *
	 * This implementation creates an object with properties
	 * linked to the string representation of the property name.
	 *
	 *
	 * HOW TO USE ENUM (EXAMPLE):
	 *
	 * 	var MouseEnum = new Enum("Dragging", "Nothing");
	 * 	var mouseState = MouseEnum.Dragging;
	 *
	 * 	switch (mouseState) {
	 * 		case MouseEnum.Dragging:
	 * 			doStuff();
	 * 		default:
	 * 			break;
	 * 	}
	 */

	function Enum() {
		for (var i=0; i < arguments.length; i++) {
			this[arguments[i]] = arguments[i];
		}
	}

	window.Enum = Enum;
})();
