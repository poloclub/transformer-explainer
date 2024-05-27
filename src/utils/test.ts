import {getTokenization} from './mock_data'

const testTokenization = async() => {
    const input = "Georgia Tech is a";
    try {
        const result = await getTokenization(input);
        console.log('Token IDs: ', result.token_ids);
        console.log('Input Tokens: ', result.input_tokens);
    } catch (error) {
        console.error('Error: ', error);
    }
}

testTokenization();

// npx tsx src/utils/test.ts