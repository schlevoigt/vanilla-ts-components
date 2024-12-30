import { AChildren, ComponentFactory, INodeComponent, mixin, Phrase } from "@vanilla-ts/core";
import { Div, Span } from "@vanilla-ts/dom";
import { LabelAlignment, LabeledComponent, LabelPosition } from "./LabeledComponent.js";


/**
 * LabeledContainer component.
 *
 * Usage notes:
 * 
 * - Although it may seem that `LabeledContainer` is a simple replacement for `Div` components (it
 *   implements `IChildren` like `Div`), this is not the case (see following points).
 * - Using `Container` or `Component` to add/remove/... components isn't wrong but unnecessary,
 *   instead use the respective functions of `LabeledContainer` itself.
 * - `clear()` is a destryoing operation(!), for an alternative see `clearContent()`.
 * - Children of `LabeledContainer` _may_ traverse the component hierarchy with `someChild.Parent`,
 *   but a single call to `Parent` is not enough. Due to the internal component tree and the use of
 *   `AElementComponentWithInternalUI`, `someChild.Parent?.Parent?.Parent` must be called to reach
 *   the containing `LabeledContainer` instance!
 */
export class LabeledContainer<EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends LabeledComponent<Span, Div, EventMap> { // eslint-disable-line @typescript-eslint/no-unsafe-declaration-merging
    /**
     * Create LabeledContainer component.
     * @param labelPhrase The phrasing content for the label.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     */
    constructor(labelPhrase: Phrase | Phrase[], lblPosition?: LabelPosition, lblAlignment?: LabelAlignment) {
        super(labelPhrase, lblPosition ?? LabelPosition.TOP, lblAlignment);
        this.initialize();
        // Set target DOM for the `IChildren` mixin!!
        this.setChildrenDOMTarget(this.component.DOM);
    }

    /**
     * Get the internal container holding all children of this container. Equivalent to `Component`,
     * just with a more descriptive name.
     */
    public get Container(): Div {
        return this.component;
    }

    /**
     * Removes _and disposes_ all children from the labeled container (except the label).
     * @returns This instance.
     */
    public clearContent(): this {
        const extracted: INodeComponent<Node>[] = [];
        this.extract(extracted);
        for (const component of extracted) {
            component.dispose();
        }
        return this;
    }

    /** @inheritdoc */
    protected override buildUI(): this {
        (this.lblPosition === LabelPosition.START) || (this.lblPosition === LabelPosition.TOP)
            ? this.ui = new Div()
                .append(
                    this.label = new Span(),
                    this.component = new Div()
                )
            : this.ui = new Div()
                .append(
                    this.component = new Div(),
                    this.label = new Span()
                );
        return this;
    }

    static {
        /** Mixin the IChildren implementation (which targets the `this.component`). */
        mixin(false, LabeledContainer, AChildren);
    }
}

/** Augment class definition with `IChildren` (see `static`). */
export interface LabeledContainer<EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends LabeledComponent<Span, Div, EventMap>, AChildren<HTMLElement, EventMap> { }

/**
 * Factory for LabeledContainer components.
 */
export class LabeledContainerFactory<T> extends ComponentFactory<LabeledContainer> {
    /**
     * Create, set up and return LabeledContainer component.
     * @param labelPhrase The phrasing content for the label.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledContainer component.
     */
    public labeledContainer(labelPhrase: Phrase | Phrase[], lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, data?: T): LabeledContainer {
        return this.setupComponent(new LabeledContainer(labelPhrase, lblPosition, lblAlignment), data);
    }
}
