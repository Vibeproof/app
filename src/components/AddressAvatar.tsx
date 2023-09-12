import React from "react";

import { renderSVGIcon, renderDataURI } from '@codingwithmanny/blockies';


export default function AddressAvatar({
    address
}: {
    address: string
}) {
    return renderDataURI({ seed: address });
}