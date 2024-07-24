import { CheckedEvent, ComponentFactory } from "@vanilla-ts/core";
import { RadioButton } from "@vanilla-ts/dom";
import { LabelAlignment, LabelPosition } from "./LabeledComponent.js";
import { LabeledInputComponent } from "./LabeledInputComponent.js";


/**
 * Additional event(s) for `LabeledRadioButton`.
 */
export interface LabeledRadioButtonEventMap extends HTMLElementEventMap {
    /** A radio button is checked/unchecked. */
    "checked": CheckedEvent<RadioButton>;
}

/**
 * Labeled radio button component.
 */
export class LabeledRadioButton extends LabeledInputComponent<RadioButton, LabeledRadioButtonEventMap> {
    /**
     * Builds the labeled radio button component.
     * @param labelText The text for the label.
     * @param id The `id` attribute of the radio button.
     * @param value The value of the radio button.
     * @param name The `name` attribute of the radio button.
     * @param labelAction Controls the following behavior:
     * - If `id` isn't defined, clicking on the label does nothing.
     * - If `id` is defined: if `labelAction` is `true` or `undefined`, a click on the label toggles
     *   the radio button (if toggling is enabled), if `labelAction` is `false`, clicking on the
     *   label does nothing.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     */
    constructor(labelText: string, id?: string, value?: string, name?: string, labelAction?: boolean, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment) {
        super(labelText, id, labelAction, lblPosition, lblAlignment);
        this.append(
            this.input = new RadioButton(id, value, name),
            this.label
        );
        // Forward this event to make handling of the component easier.
        this.input.on("checked", (ev) => {
            // ev.preventDefault();  
            ev.stopImmediatePropagation();
            this._dom.dispatchEvent(new CheckedEvent("checked", this, { Checked: ev.detail.Checked })); // eslint-disable-line jsdoc/require-jsdoc
        });
    }

    /**
     * Alternative property to 'Input' for accessing the contained radio button with a descriptive
     * name.
     */
    public get RadioButton(): RadioButton {
        return this.input;
    }

    /**
     * Get/set the checked state of the radio button (re-exported for easier direct access).
     */
    public get Checked(): boolean {
        return this.input.Checked;
    }
    /** @inheritdoc */
    public set Checked(v: boolean) {
        this.input.Checked = v;
    }

    /**
     * Set the the checked state of the radio button to checked/unchecked (re-exported for easier
     * direct access).
     * @param checked `true`, if the radio button should be checked, otherwise false.
     * @returns This instance.
     */
    public checked(checked: boolean): this {
        this.input.Checked = checked;
        return this;
    }

    /**
     * Allow toggling the radio button state (re-exported for easier direct access).
     */
    public get Toggle(): boolean {
        return this.input.Toggle;
    }
    /** @inheritdoc */
    public set Toggle(v: boolean) {
        this.input.Toggle = v;
    }

    /**
     * Allow or disallow toggling the radio button state (re-exported for easier direct access).
     * @param toggle `true`, if the radio button can be toggled, otherwise false.
     * @returns This instance.
     */
    public toggle(toggle: boolean): this {
        this.input.Toggle = toggle;
        return this;
    }
}

/**
 * Factory for LabeledRadioButton components.
 */
export class LabeledRadioButtonFactory<T> extends ComponentFactory<LabeledRadioButton> {
    /**
     * Create, set up and return LabeledRadioButton component.
     * @param labelText The text for the label.
     * @param id The `id` attribute of the radio button.
     * @param value The value of the radio button.
     * @param name The `name` attribute of the radio button.
     * @param labelAction Controls the following behavior:
     * - If `id` isn't defined, clicking on the label does nothing.
     * - If `id` is defined: if `labelAction` is `true` or `undefined`, a click on the label toggles
     *   the radio button (if toggling is enabled), if `labelAction` is `false`, clicking on the
     *   label does nothing.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledRadioButton component.
     */
    public labeledRadioButton(labelText: string, id?: string, value?: string, name?: string, labelAction?: boolean, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, data?: T): LabeledRadioButton {
        return this.setupComponent(new LabeledRadioButton(labelText, id, value, name, labelAction, lblPosition, lblAlignment), data);
    }
}
