/** LOGIC VERIFICATION **
 * 
 * test: subnetInformation(8, 24);
 * 
 * octet border of 8 (e.g. 10.0.0.0/8)
 * leaves 24 host bits (mask automatically 255.0.0.0)
 * --------/8-------/16------/24
 * 11111111.00000000.00000000.00000000
 * [NETWORK].[HOST].[HOST].[HOST]
 * add prefix length of 16
 * leaves now 16 host bits (mask now 255.255.0.0)
 * --------/8-------/16------/24
 * 11111111.11111111.00000000.00000000
 * [NETWORK].[SUBNET].[HOST].[HOST]
 * number of subnets is 2^[borrowed bits] = 8 here.
 * this would mean there are 128 subnets
 * possible num of hosts per subnet is 2^[# host bits] - 2
 * this would mean that there are 2^16 - 2 hosts/subnet (crazy)
 */

// input: 192.168.0.0/8
// check if the /8 is valid. reject something like 192.168.0.0/7 or 192.168.0.0/1
// 

class InvalidIPAddressError extends Error {
    constructor(ip_address) {
        super(`Invalid IP Address: ${ip_address}`);
    }
}

class InvalidOctetBorderPrefixLengthError extends Error {
    constructor(octet_border) {
        super(`Invalid Octet Border/Prefix Length: ${octet_border}`);
    }
}

class InvalidSubnetMaskError extends Error {
    constructor(subnet_mask) {
        super(`Invalid Subnet Mask: ${subnet_mask}`);
    }
}

class MalformedInputError extends Error {
    constructor(input) {
        super(`Input is nonsensical in context: ${input}`);
    }
}

/**
 * 
 * @param {*} input IPv4 range formatted such as 10.0.0.0/8
 * @returns if this is a valid range.
 */

function validateIPv4Range(input) {
    if (!input.match('/')) {
        throw new MalformedInputError(input);
    }

    let parts = input.split('/');
    let network_id = parts[0];
    let octet_border = parseInt(parts[1]);

    if (octet_border > 32 || octet_border < 0) {
        throw new InvalidOctetBorderPrefixLengthError(octet_border);
    }

    let network_octets_binary = '';


    let network_octets = network_id.split('.').map((octet) => {
        octet = parseInt(octet);
        if (isNaN(octet) || octet > 255 || octet < 0) throw new Error("Invalid IP Address.");
        let padding = new Array(8).fill(0);

        let octet_binary = octet.toString(2);
        return oct;
    });

    console.log([parts, network_id, octet_border, network_octets].join('\n'));

    // '/8' signifies that the left-most 8 bits (1st network octet) should be reserved.
    // This means that the 1st network octet must have a value <= 2^octet_bound - 1
    // in this case, 10 should pass.

    // suppose you had a 10.0.0.0/2 as input. 2^2-1 = 3. This should fail.

}

function validateSubnetMask(subnet_mask) {
    validateIPv4Address(subnet_mask);
    let subnet_mask_binary = dottedDecimalToBinary(subnet_mask);
    let prefix_finished = false;
    for (let char of subnet_mask_binary) {
        if (char === '0' && !prefix_finished) {
            prefix_finished = true;
            continue;
        }
        if (prefix_finished && char === '1') throw new Error("What the fuck?");
    }
    return true;
}

function validateIPv4Address(ip_address, binary) { // maybe also check for valid subnet masks.
    let ip_address_octets = ip_address.split('.');
    if (ip_address_octets.length !== 4) throw new InvalidIPAddressError(ip_address);
    ip_address_octets.forEach((octet) => {
        let octet_parsed = parseInt(octet, binary ? 2 : 10);
        if (isNaN(octet_parsed) || octet_parsed > 255 || octet_parsed < 0 || binary && octet.length > 8) throw new InvalidIPAddressError(ip_address); //throw new Error("Invalid IP Address.");
    });
    return true;
}

function dottedDecimalToBinary(ip_dottedDecimal) {
    validateIPv4Address(ip_dottedDecimal);
    let ip_binary = ip_dottedDecimal.split('.').map((decimal) => parseInt(decimal, 10).toString(2).padStart(8, '0'));
    return ip_binary.join('.');
}

function binaryToDottedDecimal(ip_binary) {
    validateIPv4Address(ip_binary, true);
    let ip_dottedDecimal = ip_binary.split('.').map((byte) => parseInt(byte, 2).toString(10)).join('.');
    return ip_dottedDecimal;
}

function getNetworkAddress(ip_address, subnet_mask) {
    let ip_address_binary = dottedDecimalToBinary(ip_address).split('.');
    let subnet_mask_binary = dottedDecimalToBinary(subnet_mask).split('.');
    let network_address = [];

    for (let i = 0; i < 4; i++) {
        network_address.push(parseInt(ip_address_binary[i], 2) & parseInt(subnet_mask_binary[i], 2));
    }

    return network_address.join('.');
}

function subnetMaskToPrefixLength(subnet_mask) {
    validateSubnetMask(subnet_mask);
    let subnet_mask_binary = dottedDecimalToBinary(subnet_mask);
    let prefix_length = 0;
    for (let i = 0; i < 32; i++) subnet_mask_binary[i] === '1' && prefix_length++;
    return prefix_length;
}

function prefixLengthToSubnetMask(prefix_length) {
    let subnet_mask_binary = '';
    for (let i = 0; i < 32; i++) {
        let on = i < prefix_length;
        subnet_mask_binary += on ? '1' : '0';
        if (i < 31 && (i + 1) % 8 == 0) subnet_mask_binary += '.';
    }
    let subnet_mask = binaryToDottedDecimal(subnet_mask_binary);
    return subnet_mask;
}

function subnetInformation(octet_border, prefix_length = 32) {
    if (prefix_length > 32 || prefix_length < 0) throw new InvalidOctetBorderPrefixLengthError(prefix_length);
    if (!(octet_border % 8 == 0) || octet_border < 8 || octet_border > 32) throw new InvalidOctetBorderPrefixLengthError(octet_border);
    let obj = {};
    obj.host_bits_allocated = 32 - octet_border;
    obj.host_bits_borrowed = prefix_length - octet_border;
    obj.host_bits_remaining = obj.host_bits_allocated - obj.host_bits_borrowed;
    obj.subnet_count = 1 << obj.host_bits_borrowed;
    obj.subnet_allocated_addresses = 1 << obj.host_bits_remaining
    obj.subnet_allocated_hosts = obj.subnet_allocated_addresses - 2;

    let subnet_mask_binary = '';
    for (let i = 0; i < 32; i++) {
        let on = i < octet_border + obj.host_bits_borrowed;
        subnet_mask_binary += on ? '1' : '0';
        if (i < 31 && (i + 1) % 8 == 0) subnet_mask_binary += '.';
    }

    obj.subnet_mask_binary = subnet_mask_binary;
    obj.subnet_mask_decimal = subnet_mask_binary.split(/\./).map((octet) => {
        return parseInt(octet, 2);
    }).join('.');

    return obj;
}

export { validateIPv4Address, subnetInformation, prefixLengthToSubnetMask, subnetMaskToPrefixLength };