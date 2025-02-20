import { ComponentFactory, Phrase } from "@vanilla-ts/core";
import { A, Div, Span } from "@vanilla-ts/dom";
import { LabelAlignment, LabeledComponent, LabelPosition } from "./LabeledComponent.js";


/**
 * Labeled anchor component. Can be used to display hyperlink which has a label,
 * @inheritdoc
 */
export class LabeledAnchor<EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends LabeledComponent<Span, A, EventMap> {
    /**
     * Create LabeledAnchor component.
     * @param labelPhrase The phrasing content for the label.
     * @param anchorPhrase The phrasing content for the p element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     */
    constructor(labelPhrase: Phrase | Phrase[], anchorPhrase: Phrase | Phrase[], lblPosition?: LabelPosition, lblAlignment?: LabelAlignment) {
        super(labelPhrase, lblPosition ?? LabelPosition.START, lblAlignment);
        this.initialize();
        Array.isArray(anchorPhrase)
            ? this.component.phrase(...anchorPhrase)
            : this.component.phrase(anchorPhrase);
    }

    /**
     * Get P component of this component. Equivalent to `Component`, just with a more descriptive
     * name.
     */
    public get Anchor(): A {
        return this.component;
    }

    /**
     * Get/set the href attribute for the anchor.
     */
    public get HRef(): string {
        return this.Anchor.DOM.href;
    }
    /** @inheritdoc */
    public set HRef(value: string) {
        this.Anchor.DOM.href = value;
    }

    /**
     * Set the phrasing content of the components anchor. __The setter `LabelPhrase` here is an
     * alias for the property `this.Anchor.Phrase`.__
     */
    public set Phrase(phrase: Phrase | Phrase[]) {
        this.component.Phrase = phrase;
    }

    /**
     * Set the phrasing content of the the components anchor. __The function `labelPhrase()` here
     * is an alias for the function `this.Label.phrase()` but it returns _this_ instance instead of
     * the 'Anchor' instance.__
     * @param phrase The phrasing content to be set for the anchor.
     * @returns This instance.
     */
    public phrase(...phrase: Phrase[]): this {
        this.component.phrase(...phrase);
        return this;
    }

    /** @inheritdoc */
    protected override buildUI(): this {
        (this.lblPosition === LabelPosition.START) || (this.lblPosition === LabelPosition.TOP)
            ? this.ui = new Div()
                .append(
                    this.label = new Span(),
                    this.component = new A()
                )
            : this.ui = new Div()
                .append(
                    this.component = new A(),
                    this.label = new Span()
                );
        return this;
    }
}

/**
 * Factory for LabeledAnchor components.
 */
export class LabeledAnchorFactory<T> extends ComponentFactory<LabeledAnchor> {
    /**
     * Create, set up and return LabeledAnchor component.
     * @param labelPhrase The phrasing content for the label.
     * @param anchorPhrase The phrasing content for the p element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledAnchor component.
     */
    public labeledAnchor(labelPhrase: Phrase | Phrase[], anchorPhrase: Phrase | Phrase[], lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, data?: T): LabeledAnchor {
        return this.setupComponent(new LabeledAnchor(labelPhrase, anchorPhrase, lblPosition, lblAlignment), data);
    }
}
