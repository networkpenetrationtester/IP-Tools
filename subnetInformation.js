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

/* /**
 * Takes in an IPv4 Range and checks if the Prefix Length is valid.
 * @param {string} ip_address_range IPv4 Range formatted such as 10.0.0.0/8
 * @returns {object} Min and Max value, # of hosts, # of addresses
 *\/

function validateIPv4Range(ip_address_range) {
    if (!ip_address_range.match('/')) throw new MalformedInputError(ip_address_range);
    let parts = ip_address_range.split('/');
    if (parts.length != 2) throw new MalformedInputError(ip_address_range);

    let dotted_decimal = parts[0];
    let prefix_length = parseInt(parts[1]);

    // check if prefix_length bit count is enough to represent all the octets that != 0
    // e.g. reject something like 192.168.0.1/24 because it is a HOST address, not a network range.

    validateDottedAddress(dotted_decimal);
    if (prefix_length > 32 || prefix_length < 0) {
        throw new InvalidNetworkPrefixError(prefix_length);
    }

    let range = { low, high };

    let network_octets_binary = dottedDecimalToBinary(prefixLengthToSubnetMask(prefix_length));
    let dotted_binary =


        console.log([parts, dotted_decimal, prefix_length, network_octets].join('\n'));
    // '/8' signifies that the left-most 8 bits (1st network octet) should be reserved.
    // This means that the 1st network octet must have a value <= 2^octet_bound - 1
    // in this case, 10 should pass.
    // suppose you had a 10.0.0.0/2 as input. 2^2-1 = 3. This should fail.
    // suppose you had a 10.0.0.0/8. This program should return the range of ip addresses. (i.e. 10.0.0.0 - 10.255.255.255)
} */

/**
 * Validates a MAC Address.
 * @param {string} mac_address Input MAC Addresses as XX-XX-XX-XX-XX-XX.
 * @returns {string} the MAC Address is returned if valid.
 */

function validateMACAddress(mac_address) {
    let mac_address_octets = mac_address.split('-');
    if (mac_address_octets.length !== 6) throw new InvalidMACAddressError(mac_address);
    mac_address_octets.forEach((octet) => {
        let octet_parsed = parseInt(octet, 16);
        console.log(octet_parsed);
        if (isNaN(octet_parsed) || octet_parsed > 255 || octet_parsed < 0) throw new InvalidMACAddressError(mac_address);
    });
    //idrk how to validate a mac ngl
    return mac_address;
}

/**
 * Validates various types of IPv4 Addresses. Supports Subnet Masks, and IPv4 Addresses, allows for Subnet Mask/Subnet Prefix Length validation, in both Decimal and Binary forms.
 * @param {*} dotted_address The Dotted Decimal/Binary Address/Subnet Mask.
 * @param {*} binary Set to true if using Binary form.
 * @param {*} subnet_mask Set to true if this Dotted value is supposed to be a Subnet Mask.
 * @returns dotted_address if valid.
 */

function validateDottedAddress(dotted_address, binary = false, subnet_mask = false) { // maybe also check for valid subnet masks.
    let octets = dotted_address.split('.');
    let error_type = subnet_mask ? InvalidSubnetMaskError : InvalidIPv4AddressError;
    if (octets.length !== 4) return softError(new error_type(dotted_address, binary));
    for (let octet of octets) {
        let octet_parsed = parseInt(octet, binary ? 2 : 10);
        let octet_valid = octet.length >= 1 && octet.length <= (binary ? 8 : 3) && !isNaN(octet_parsed) && octet_parsed <= 255 && octet_parsed >= 0;
        if (!octet_valid) return softError(new error_type(dotted_address, binary));
    };
    // I guess I'd allow shit like 11111111.111.0.0 as a binary subnet mask, but that's so dumb and impractical why would anyone do that?
    if (subnet_mask) {
        let tmp_subnet_mask = binary ? dotted_address : dottedDecimalToBinary(dotted_address);
        let tmp_subnet_mask_padded = tmp_subnet_mask.split('.').map((x) => x.padStart(8, '0')).join('.'); // already know this will pass tests from earlier
        if (tmp_subnet_mask_padded.match(/0.*1/g)) return softError(new InvalidSubnetMaskError(tmp_subnet_mask_padded, binary));
    }
    return dotted_address;
}

/**
 * Converts Dotted Decimal to Dotted Binary.
 * @param {*} dotted_decimal Dotted Decimal. 
 * @returns Dotted Binary.
 */

function dottedDecimalToBinary(dotted_decimal, subnet_mask = false) {
    validateDottedAddress(dotted_decimal, false, subnet_mask);
    let ip_binary = dotted_decimal.split('.').map((decimal) => parseInt(decimal, 10).toString(2).padStart(8, '0'));
    return ip_binary.join('.');
}

/**
 * Converts Dotted Binary to Dotted Decimal.
 * @param {*} dotted_decimal Dotted Binary. 
 * @returns Dotted Decimal.
 */

function dottedBinaryToDecimal(dotted_binary, subnet_mask = false) {
    validateDottedAddress(dotted_binary, true, subnet_mask);
    let ip_dotted_decimal = dotted_binary.split('.').map((byte) => parseInt(byte, 2).toString(10)).join('.');
    return ip_dotted_decimal;
}

/**
 * Convert a Subnet Mask into an IPv4 Prefix Length.
 * @param {string} subnet_mask Subnet Mask.
 * @returns {number} IPv4 Prefix Length.
 */

function subnetMaskToPrefixLength(subnet_mask) {
    validateDottedAddress(subnet_mask, false, true); // check if this specifically is a valid subnet_mask first.
    let subnet_mask_binary = dottedDecimalToBinary(subnet_mask); // includes extra check, annoying.
    let prefix_length = subnet_mask_binary.match(/1/g)?.length;
    prefix_length ??= 0;
    return prefix_length;
}

/**
 * Convert an IPv4 Prefix Length into a Subnet Mask.
 * @param {number} prefix_length IPv4 Prefix Length.
 * @returns {string} IPv4 Subnet Mask.
 */

function prefixLengthToSubnetMask(prefix_length) {
    let subnet_mask_binary = '';
    for (let i = 0; i < 32; i++) {
        let on = i < prefix_length;
        subnet_mask_binary += on ? '1' : '0';
        if (i < 31 && (i + 1) % 8 == 0) subnet_mask_binary += '.';
    }
    let subnet_mask = dottedBinaryToDecimal(subnet_mask_binary); // includes validation check
    return subnet_mask;
}

/**
 * The EUI-64 Interface ID generator.
 * @param {string} ipv6_network_prefix The Network Prefix given by a RA.
 * @param {string} mac_address The MAC Address of the interface.
 * @returns {string} Complete, EUI-64 generated IPv6 GUA.
 */

function EUI_64(ipv6_network_prefix, mac_address) {

}

/**
 * De-code MAC Address and IPv6 Network Prefix from an IPv6 Address generated by EUI-64.
 * @param {string} ipv6_address An IPv6 Address generated by the EUI-64 process.
 * @returns {{ipv6_network_prefix: string, mac_address: string}} MAC Address and IPv6 Network Prefix.
 */

function UnEUI_64(ipv6_address) {

}

/**
 * Minimize or maximize (why) an IPv6 Address.
 * @param {string} ipv6_address IPv6 Address to modify.
 * @param {boolean} flag true = beautify, false = uglify.
 * @returns {string} Pretty/ugly IPv6 Address.
 */

function IPv6DoubleColon(ipv6_address, flag) {

}

/**
 * Get Network Address using IPv4 Host Address and Subnet Mask.
 * @param {string} ip_address IPv4 Host Address in dotted decimal format.
 * @param {string} subnet_mask Subnet Mask in dotted decimal format.
 * @returns {string} IPv4 Network Address.
 */

function getNetworkAddress(ip_address, subnet_mask) {
    validateDottedAddress(ip_address);
    validateDottedAddress(subnet_mask);
    let ip_address_binary = dottedDecimalToBinary(ip_address).split('.');
    let subnet_mask_binary = dottedDecimalToBinary(subnet_mask).split('.');
    let network_address = [];
    for (let i = 0; i < 4; i++) {
        network_address.push(parseInt(ip_address_binary[i], 2) & parseInt(subnet_mask_binary[i], 2));
    }
    return network_address.join('.');
}

/**
 * Collection of useful calculations. Can be chained with other things, such as subnetMaskToPrefixLength.
 * @param {number} network_prefix The Network Prefix.
 * @param {number} subet_prefix The Subnet Prefix.
 * @returns {object} Summary of useful information.
 */

function subnetInformation(network_prefix, subet_prefix = 32) { // pretty ! may rename to 'calculatehosts' or something, as other functions obsolete much of this code.
    if (subet_prefix > 32 || subet_prefix < 0) throw new InvalidSubnetPrefixError(subet_prefix);
    if (!(network_prefix % 8 == 0) || network_prefix < 8 || network_prefix > 32) throw new InvalidNetworkPrefixError(network_prefix);
    // if (!(network_prefix % 8 == 0) || network_prefix < 8 || network_prefix > 32) throw new InvalidOctetBorderError(network_prefix);
    let obj = {};
    obj.host_bits_allocated = 32 - network_prefix;
    obj.host_bits_borrowed = subet_prefix - network_prefix;
    if (host_bits_borrowed < 0) throw new Error("Idrk what to tell you");
    obj.host_bits_remaining = obj.host_bits_allocated - obj.host_bits_borrowed;
    obj.subnet_count = 1 << obj.host_bits_borrowed;
    obj.subnet_allocated_addresses = 1 << obj.host_bits_remaining
    obj.subnet_allocated_hosts = obj.subnet_allocated_addresses - 2;
    let subnet_mask_binary = '';
    for (let i = 0; i < 32; i++) {
        let on = i < network_prefix + obj.host_bits_borrowed;
        let end_octet = i < 31 && (i + 1) % 8 == 0;
        subnet_mask_binary += on ? '1' : '0';
        end_octet && (subnet_mask_binary += '.');
    }
    obj.subnet_mask_binary = subnet_mask_binary;
    obj.subnet_mask_decimal = subnet_mask_binary.split(/\./).map((octet) => {
        return parseInt(octet, 2);
    }).join('.');
    return obj;
}

export {
    validateDottedAddress,
    validateIPv4Range,
    validateMACAddress,
    dottedDecimalToBinary,
    dottedBinaryToDecimal,
    subnetMaskToPrefixLength,
    prefixLengthToSubnetMask,
    EUI_64,
    IPv6DoubleColon,
    getNetworkAddress,
    subnetInformation
}