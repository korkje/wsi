async function* iter() {
    let count = 0;

    yield count++;

    try {
        while (true) {
            yield count++;
        }
    }
    catch {
        console.log("CATCH");
    }
    finally {
        console.log("FINALLY");
    }
}

for await (const n of iter()) {
    console.log(n);

    if (n === 10) {
        break;
    }
}
