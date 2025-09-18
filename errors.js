class InvalidIPv4AddressError extends Error {
    constructor(ip_address, binary) {
        super(`Invalid IPv4 Address: ${ip_address}`);
    }
}

class InvalidSubnetMaskError extends Error {
    constructor(subnet_mask, binary) {
        super(`Invalid Subnet Mask: ${subnet_mask} (${binary ? 'Already in Binary.' : dottedDecimalToBinary(subnet_mask)})`);
    }
}

class InvalidNetworkPrefixError extends Error {
    constructor(network_prefix) {
        super(`Invalid Network Prefix: ${network_prefix}`);
    }
}

class InvalidSubnetPrefixError extends Error {
    constructor(subnet_prefix) {
        super(`Invalid Subnet Prefix: ${subnet_prefix}`);
    }
}

class InvalidMACAddressError extends Error {
    constructor(mac_address) {
        super(`Invalid MAC Address: ${mac_address}`);
    }
}

class MalformedInputError extends Error {
    constructor(input) {
        super(`Input is nonsensical in context: ${input}`);
    }
}

function softError(e) {
    console.error(e);
    return false;
}

export { InvalidIPv4AddressError, InvalidSubnetMaskError, InvalidNetworkPrefixError, InvalidSubnetPrefixError, InvalidMACAddressError, MalformedInputError, softError }