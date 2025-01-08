import { CheckedEvent, ComponentFactory, Phrase } from "@vanilla-ts/core";
import { Checkbox } from "@vanilla-ts/dom";
import { LabelAlignment, LabelPosition } from "./LabeledComponent.js";
import { LabeledInputComponent } from "./LabeledInputComponent.js";


/**
 * Additional event(s) for `LabeledCheckbox`.
 */
export interface LabeledCheckboxEventMap extends HTMLElementEventMap {
    /** A checkbox is checked/unchecked. */
    "checked": CheckedEvent<Checkbox>;
}

/**
 * Labeled checkbox component.
 */
export class LabeledCheckbox<EventMap extends LabeledCheckboxEventMap = LabeledCheckboxEventMap> extends LabeledInputComponent<Checkbox, EventMap> {
    /**
     * Create LabeledCheckbox component.\
     * __Note:__ Although all possible combinations of `LabelPosition` and `LabelAlignment` are
     * implemented, using settings other than `LabelPosition.START`, `LabelPosition.END` and
     * `LabelAlignment.START` can lead to a visually rather weird appearance.
     * @param labelPhrase The phrasing content for the label.
     * @param id The `id` attribute of the checkbox input element.
     * @param value The value of the checkbox input element.
     * @param name The `name` attribute of the checkbox input element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param labelAction Controls the following behavior:
     * - If `id` isn't defined, clicking on the label does nothing.
     * - If `id` is defined: if `labelAction` is `true` or `undefined`, a click on the label toggles
     *   the checkbox input element, if `labelAction` is `false`, clicking on the label does
     *   nothing.
     */
    constructor(labelPhrase: Phrase | Phrase[], id?: string, value?: string, name?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, labelAction?: boolean) {
        super(labelPhrase, id, lblPosition ?? LabelPosition.END, lblAlignment, labelAction);
        this.component = new Checkbox(id, value, name)
            // Forward this event to make handling of the component easier.
            .on("checked", (ev) => {
                // ev.preventDefault();  
                ev.stopImmediatePropagation();
                this.emit(new CheckedEvent("checked", this, { Checked: ev.detail.Checked })); // eslint-disable-line jsdoc/require-jsdoc
            });
        (this.lblPosition === LabelPosition.START) || (this.lblPosition === LabelPosition.TOP)
            ? this.ui.append(this.component)
            : this.ui.insert(0, this.component);
    }

    /**
     * Get Checkbox component of this component. Equivalent to `Component`, just with a more
     * descriptive name.
     */
    public get Checkbox(): Checkbox {
        return this.component;
    }

    /**
     * Get/set the checked state of the checkbox (re-exported for easier direct access).
     */
    public get Checked(): boolean {
        return this.component.Checked;
    }
    /** @inheritdoc */
    public set Checked(v: boolean) {
        this.component.Checked = v;
    }

    /**
     * Set the the checked state of the checkbox to checked/unchecked (re-exported for easier direct
     * access).
     * @param checked `true`, if the checkbox should be checked, otherwise false.
     * @returns This instance.
     */
    public checked(checked: boolean): this {
        this.component.Checked = checked;
        return this;
    }

    /**
     * Get/set the indeterminate state of the checkbox (re-exported for easier direct access).
     */
    public get Indeterminate(): boolean {
        return this.component.Indeterminate;
    }
    /** @inheritdoc */
    public set Indeterminate(v: boolean) {
        this.component.Indeterminate = v;
    }

    /**
     * Sets the indeterminate state of the checkbox to indeterminate/determinate (re-exported for
     * easier direct access).
     * @param indeterminate `true`, if the state of the checkbox should be indeterminate, otherwise
     * false.
     * @returns This instance.
     */
    public indeterminate(indeterminate: boolean): this {
        this.component.indeterminate(indeterminate);
        return this;
    }
}

/**
 * Factory for LabeledCheckbox components.
 */
export class LabeledCheckboxFactory<T> extends ComponentFactory<LabeledCheckbox> {
    /**
     * Create, set up and return LabeledCheckbox component.\
     * __Note:__ Although all possible combinations of `LabelPosition` and `LabelAlignment` are
     * implemented, using settings other than `LabelPosition.START`, `LabelPosition.END` and
     * `LabelAlignment.START` can lead to a visually rather weird appearance.
     * @param labelPhrase The phrasing content for the label.
     * @param id The `id` attribute of the checkbox input element.
     * @param value The value of the checkbox input element.
     * @param name The `name` attribute of the checkbox input element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param labelAction Controls the following behavior:
     * - If `id` isn't defined, clicking on the label does nothing.
     * - If `id` is defined: if `labelAction` is `true` or `undefined`, a click on the label toggles
     *   the checkbox input element, if `labelAction` is `false`, clicking on the label does
     *   nothing.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledCheckbox component.
     */
    public labeledCheckbox(labelPhrase: Phrase | Phrase[], id?: string, value?: string, name?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, labelAction?: boolean, data?: T): LabeledCheckbox {
        return this.setupComponent(new LabeledCheckbox(labelPhrase, id, value, name, lblPosition, lblAlignment, labelAction), data);
    }
}
