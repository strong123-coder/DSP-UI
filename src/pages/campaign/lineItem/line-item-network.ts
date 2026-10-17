import { createContext, useContext } from "react";

// At org level, the network of the campaign being edited: the line item's
// list pickers only offer lists that network's line items may use. Undefined
// inside a network (the API already answers for it).
export const LineItemNetworkContext = createContext<string | undefined>(undefined);

export const useLineItemNetwork = () => useContext(LineItemNetworkContext);
