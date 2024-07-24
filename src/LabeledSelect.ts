import { ComponentFactory } from "@vanilla-ts/core";
import { ISelectValues, Label, Select } from "@vanilla-ts/dom";
import { LabelAlignment, LabeledComponent, LabelPosition } from "./LabeledComponent.js";


/**
 * Labeled TextArea component.
 */
export class LabeledSelect extends LabeledComponent<Label> {
    protected _select: Select;

    /**
     * Builds the labeled select component.
     * @param labelText The text for the label.
     * @param values The values to be displayed in the select component.
     * @param id The id (attribute) of the select component.
     * @param value The value of the select component.
     * @param name The name (attribute) of the select component.
     * @param labelAction Controls the following behavior:
     * - If `id` isn't defined, clicking on the label does nothing.
     * - If `id` is defined: if `labelAction` is `true` or `undefined`, a click on the label focuses
     *   the select component, if `labelAction` is `false`, clicking on the label does nothing.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     */
    constructor(labelText: string, values: ISelectValues[], id?: string, value?: string, name?: string, labelAction?: boolean, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment) {
        super("div", lblPosition, lblAlignment);
        this.append(
            this.label = new Label(
                labelText,
                id && (labelAction === undefined || labelAction === true)
                    ? id
                    : undefined
            ),
            this._select = new Select(values, id, value, name)
        );
    }

    /**
     * Get select component of this component.
     */
    public get Select(): Select {
        return this._select;
    }
}

/**
 * Factory for LabeledSelect components.
 */
export class LabeledSelectFactory<T> extends ComponentFactory<LabeledSelect> {
    /**
     * Create, set up and return LabeledSelect component.
     * @param labelText The text for the label.
     * @param values The values to be displayed in the select component.
     * @param id The id (attribute) of the select component.
     * @param value The value of the select component.
     * @param name The name (attribute) of the select component.
     * @param labelAction Controls the following behavior:
     * - If `id` isn't defined, clicking on the label does nothing.
     * - If `id` is defined: if `labelAction` is `true` or `undefined`, a click on the label focuses
     *   the select component, if `labelAction` is `false`, clicking on the label does nothing.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledSelect component.
     */
    public labeledSelect(labelText: string, values: ISelectValues[], id?: string, value?: string, name?: string, labelAction?: boolean, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, data?: T): LabeledSelect {
        return this.setupComponent(new LabeledSelect(labelText, values, id, value, name, labelAction, lblPosition, lblAlignment), data);
    }
}
