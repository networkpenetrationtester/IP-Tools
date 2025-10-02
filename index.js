import { dottedBinaryToDecimal, subnetInformation, subnetMaskToPrefixLength } from "./src/modules.js";

// Let's do some cursed shit.
let network_prefix = 8; // standard for an /8 network. get this by splitting the IP address.
// Future implementation of this code may allow you to calculate IPv4/6 Ranges from the notation.
// Future implementation of this code may also allow you to minimize/maximize IPv6 Addresses.
let subnet_mask_binary = '11111111.11111111.0.0' // /16 subnet/prefix length equivalent
let subnet_mask = dottedBinaryToDecimal(subnet_mask_binary, true);
let prefix_length = subnetMaskToPrefixLength(subnet_mask);
let info = subnetInformation(network_prefix, prefix_length);
console.log(info);