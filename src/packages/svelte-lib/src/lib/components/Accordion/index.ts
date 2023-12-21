import OriginalAccordion from "./Accordion.svelte";
import AccordionItem from "./AccordionItem.svelte";

interface AccordionProps {
  new (
    ...args: ConstructorParameters<typeof OriginalAccordion>
  ): OriginalAccordion;
  Item: typeof AccordionItem;
}
const Accordion = OriginalAccordion as AccordionProps;
Accordion.Item = AccordionItem;

export { Accordion };
