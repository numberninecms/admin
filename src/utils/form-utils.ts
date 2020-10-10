/*
 * This file is part of the NumberNine package.
 *
 * (c) William Arin <williamarin.dev@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @see https://stackoverflow.com/a/4812022/1159013
 */
export function getCaretPosition(element) {
    let caretOffset = 0;
    const doc = element.ownerDocument || element.document;
    const win = doc.defaultView || doc.parentWindow;
    const sel = win.getSelection();

    if (sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        caretOffset = preCaretRange.toString().length;
    }

    return caretOffset;
}

/**
 * @see https://stackoverflow.com/a/41034697/1159013
 */
function createRange(node, chars, range: Range|null = null) {
    if (!range) {
        range = document.createRange()
        range.selectNode(node);
        range.setStart(node, 0);
    }

    if (chars.count === 0) {
        range.setEnd(node, chars.count);
    } else if (node && chars.count >0) {
        if (node.nodeType === Node.TEXT_NODE) {
            if (node.textContent.length < chars.count) {
                chars.count -= node.textContent.length;
            } else {
                range.setEnd(node, chars.count);
                chars.count = 0;
            }
        } else {
            for (let lp = 0; lp < node.childNodes.length; lp++) {
                range = createRange(node.childNodes[lp], chars, range);

                if (chars.count === 0) {
                    break;
                }
            }
        }
    }

    return range;
}

/**
 * @see https://stackoverflow.com/a/41034697/1159013
 */
export function setCaretPosition(element, chars) {
    if (chars >= 0) {
        const selection = window.getSelection()!;

        const range = createRange(element, { count: chars });

        if (range) {
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
}
