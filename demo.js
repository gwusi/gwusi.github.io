// Demo JavaScript for Extension Event Handling Issues
// This script demonstrates how normal event handling should work
// When the extension is active, these behaviors will be disrupted

let eventCounter = 0;
let eventsBlocked = 0;
let sequenceErrors = 0;
let totalDelay = 0;
let delayMeasurements = [];

// Utility functions
function log(message, type = 'info') {
    const logContainer = document.getElementById('eventLog');
    const timestamp = new Date().toLocaleTimeString();
    const typeClass = type === 'error' ? 'error' : type === 'warning' ? 'warning' : type === 'success' ? 'success' : '';
    
    const logEntry = document.createElement('div');
    logEntry.innerHTML = `<span class="timestamp">[${timestamp}]</span> <span class="event-type ${typeClass}">${message}</span>`;
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

function updateMetrics() {
    document.getElementById('eventsBlocked').textContent = eventsBlocked;
    document.getElementById('averageDelay').textContent = 
        delayMeasurements.length > 0 ? Math.round(delayMeasurements.reduce((a, b) => a + b, 0) / delayMeasurements.length) + 'ms' : '0ms';
    document.getElementById('sequenceErrors').textContent = sequenceErrors;
}

function measureEventDelay(startTime, eventType) {
    const delay = performance.now() - startTime;
    delayMeasurements.push(delay);
    
    if (delay > 50) { // Lowered threshold to catch more issues
        log(`⚠️ ${eventType} delayed by ${Math.round(delay)}ms`, 'warning');
        eventsBlocked++;
    } else if (delay > 10) {
        log(`ℹ️ ${eventType} minor delay: ${Math.round(delay)}ms`, 'info');
    }
    
    updateMetrics();
}

// Issue 1: Event Sequence Disruption
document.getElementById('sequenceTest').addEventListener('click', function(e) {
    const startTime = performance.now();
    log('🔍 Starting event sequence test...', 'info');
    
    // Test normal event progression
    setTimeout(() => {
        measureEventDelay(startTime, 'click');
        log('✅ Click event processed normally', 'success');
    }, 10);
    
    // Simulate what should happen immediately
    this.classList.add('pulsing');
    setTimeout(() => {
        this.classList.remove('pulsing');
    }, 1000);
});

document.getElementById('rapidClick').addEventListener('click', function() {
    log('🚀 Starting rapid click test - watch for event blocking...', 'info');
    let clickCount = 0;
    
    const rapidClickTest = () => {
        clickCount++;
        const startTime = performance.now();
        
        // This should fire immediately
        setTimeout(() => {
            measureEventDelay(startTime, `rapid-click-${clickCount}`);
        }, 5);
        
        if (clickCount < 10) {
            setTimeout(rapidClickTest, 100);
        } else {
            log('📊 Rapid click test completed', 'info');
        }
    };
    
    rapidClickTest();
});

// Rapid button click handlers
document.querySelectorAll('.rapid-btn').forEach((btn, index) => {
    btn.addEventListener('click', function(e) {
        const startTime = performance.now();
        log(`🎯 Rapid button ${index + 1} clicked`, 'info');
        
        setTimeout(() => {
            measureEventDelay(startTime, `rapid-btn-${index + 1}`);
        }, 5);
        
        // Visual feedback
        this.style.backgroundColor = '#4caf50';
        setTimeout(() => {
            this.style.backgroundColor = '';
        }, 200);
    });
    
    // Test double-click behavior
    btn.addEventListener('dblclick', function() {
        log(`⚡ Double-click on button ${index + 1} - this may be disrupted`, 'warning');
    });
});

document.getElementById('clearLog').addEventListener('click', function() {
    document.getElementById('eventLog').innerHTML = '<div class="timestamp">[LOG CLEARED]</div> Event monitoring reset...';
    eventsBlocked = 0;
    sequenceErrors = 0;
    delayMeasurements = [];
    updateMetrics();
});

// Issue 2: Form Submission and Input Delays
document.getElementById('testForm').addEventListener('submit', function(e) {
    const startTime = performance.now();
    log('📝 Form submission attempted...', 'info');
    
    // Prevent actual submission for demo
    e.preventDefault();
    
    setTimeout(() => {
        measureEventDelay(startTime, 'form-submit');
        log('✅ Form would have been submitted (blocked for demo)', 'success');
    }, 10);
});

document.getElementById('doubleSubmit').addEventListener('click', function() {
    log('⚠️ Testing double submission scenario...', 'warning');
    
    // Simulate rapid form submissions
    const form = document.getElementById('testForm');
    const submitEvent1 = new Event('submit', { bubbles: true, cancelable: true });
    const submitEvent2 = new Event('submit', { bubbles: true, cancelable: true });
    
    form.dispatchEvent(submitEvent1);
    setTimeout(() => {
        form.dispatchEvent(submitEvent2);
        log('📊 Double submit test - second submit may be blocked/delayed', 'warning');
    }, 50);
});

// Input event monitoring
document.querySelectorAll('.focus-input').forEach((input, index) => {
    input.addEventListener('focus', function(e) {
        const startTime = performance.now();
        log(`🎯 Focus event on field ${index + 1}`, 'info');
        
        setTimeout(() => {
            measureEventDelay(startTime, `focus-${index + 1}`);
        }, 5);
    });
    
    input.addEventListener('blur', function(e) {
        log(`👋 Blur event on field ${index + 1}`, 'info');
    });
    
    input.addEventListener('keydown', function(e) {
        const startTime = performance.now();
        
        setTimeout(() => {
            measureEventDelay(startTime, `keydown-${e.key}`);
        }, 5);
    });
});

// ContentEditable monitoring (extension specifically targets these)
document.querySelectorAll('[contenteditable="true"]').forEach((element, index) => {
    element.addEventListener('input', function(e) {
        const startTime = performance.now();
        log(`📝 ContentEditable ${index + 1} input event`, 'info');
        
        setTimeout(() => {
            measureEventDelay(startTime, `contenteditable-input-${index + 1}`);
        }, 5);
    });
    
    element.addEventListener('focus', function(e) {
        const startTime = performance.now();
        log(`🎯 ContentEditable ${index + 1} focused`, 'info');
        
        setTimeout(() => {
            measureEventDelay(startTime, `contenteditable-focus-${index + 1}`);
        }, 5);
    });
    
    element.addEventListener('keydown', function(e) {
        const startTime = performance.now();
        
        setTimeout(() => {
            measureEventDelay(startTime, `contenteditable-keydown-${e.key}`);
        }, 5);
    });
});

// Issue 3: Event Bubbling and Propagation
document.getElementById('parentContainer').addEventListener('click', function(e) {
    if (e.target === this) {
        log('🔄 Parent container clicked - event bubbled correctly', 'success');
    } else {
        log('🔄 Event bubbled to parent container', 'info');
    }
});

document.getElementById('childContainer').addEventListener('click', function(e) {
    if (e.target === this) {
        log('📦 Child container clicked', 'info');
    }
});

document.getElementById('bubbleTest').addEventListener('click', function(e) {
    const startTime = performance.now();
    log('🧪 Testing event bubbling...', 'info');
    
    // This should bubble to parent containers
    setTimeout(() => {
        measureEventDelay(startTime, 'bubble-test');
        log('✅ Bubble test click processed', 'success');
    }, 10);
});

// Context menu testing
document.getElementById('contextBtn').addEventListener('contextmenu', function(e) {
    e.preventDefault();
    const startTime = performance.now();
    log('📋 Context menu requested', 'info');
    
    const menu = document.getElementById('contextualMenu');
    menu.style.display = 'block';
    menu.style.left = e.pageX + 'px';
    menu.style.top = e.pageY + 'px';
    
    setTimeout(() => {
        measureEventDelay(startTime, 'context-menu');
    }, 10);
    
    // Hide menu after 3 seconds
    setTimeout(() => {
        menu.style.display = 'none';
    }, 3000);
});

// Dynamic content testing
let dynamicContentCounter = 0;
document.getElementById('addContent').addEventListener('click', function() {
    const startTime = performance.now();
    dynamicContentCounter++;
    
    const newElement = document.createElement('div');
    newElement.innerHTML = `
        <div style="padding: 10px; margin: 5px; background: #e3f2fd; border-radius: 5px;">
            <strong>Dynamic Content ${dynamicContentCounter}</strong>
            <button onclick="dynamicButtonClick(${dynamicContentCounter})" style="margin-left: 10px; padding: 5px 10px;">
                Click Me
            </button>
        </div>
    `;
    
    document.getElementById('dynamicArea').appendChild(newElement);
    
    setTimeout(() => {
        measureEventDelay(startTime, 'add-dynamic-content');
        log(`➕ Added dynamic content ${dynamicContentCounter}`, 'success');
    }, 10);
});

document.getElementById('removeContent').addEventListener('click', function() {
    const dynamicArea = document.getElementById('dynamicArea');
    const lastChild = dynamicArea.lastElementChild;
    
    if (lastChild) {
        lastChild.remove();
        log(`➖ Removed dynamic content`, 'info');
    } else {
        log(`❌ No dynamic content to remove`, 'warning');
    }
});

// Global function for dynamic buttons
window.dynamicButtonClick = function(id) {
    const startTime = performance.now();
    log(`🎯 Dynamic button ${id} clicked`, 'info');
    
    setTimeout(() => {
        measureEventDelay(startTime, `dynamic-btn-${id}`);
    }, 10);
};

// Drag and drop testing
const dropZone = document.getElementById('dropZone');

dropZone.addEventListener('dragenter', function(e) {
    e.preventDefault();
    this.classList.add('dragover');
    log('📁 Drag enter detected', 'info');
});

dropZone.addEventListener('dragover', function(e) {
    e.preventDefault();
});

dropZone.addEventListener('dragleave', function(e) {
    this.classList.remove('dragover');
    log('👋 Drag leave detected', 'info');
});

dropZone.addEventListener('drop', function(e) {
    e.preventDefault();
    const startTime = performance.now();
    this.classList.remove('dragover');
    
    log('📦 Drop event triggered', 'info');
    
    const files = Array.from(e.dataTransfer.files);
    
    setTimeout(() => {
        measureEventDelay(startTime, 'file-drop');
        
        if (files.length > 0) {
            log(`📄 ${files.length} file(s) dropped: ${files.map(f => f.name).join(', ')}`, 'success');
            
            const fileList = document.getElementById('droppedFiles');
            fileList.innerHTML = '<h4>Dropped Files:</h4>' + 
                files.map(f => `<div>• ${f.name} (${f.size} bytes)</div>`).join('');
        } else {
            log('❌ No files in drop event', 'warning');
        }
    }, 10);
});

// Focus and keyboard testing
let keyPressCount = 0;
document.getElementById('keyTest').addEventListener('focus', function() {
    log('🎯 Key test button focused - try typing', 'info');
});

document.getElementById('keyTest').addEventListener('keydown', function(e) {
    const startTime = performance.now();
    keyPressCount++;
    
    setTimeout(() => {
        measureEventDelay(startTime, `key-${e.key}`);
        document.getElementById('keyCounter').textContent = `Key Presses: ${keyPressCount}`;
        log(`⌨️ Key pressed: ${e.key} (${e.keyCode})`, 'info');
    }, 10);
});

// Tab navigation testing
['tabTest1', 'tabTest2', 'tabTest3'].forEach((id, index) => {
    document.getElementById(id).addEventListener('focus', function() {
        const startTime = performance.now();
        log(`🎯 Tab stop ${index + 1} focused`, 'info');
        
        setTimeout(() => {
            measureEventDelay(startTime, `tab-focus-${index + 1}`);
        }, 5);
    });
    
    document.getElementById(id).addEventListener('click', function() {
        const startTime = performance.now();
        log(`🖱️ Tab stop ${index + 1} clicked`, 'info');
        
        setTimeout(() => {
            measureEventDelay(startTime, `tab-click-${index + 1}`);
        }, 5);
    });
});

// Network request testing
document.getElementById('fetchTest').addEventListener('click', async function() {
    const startTime = performance.now();
    log('🌐 Starting fetch API test...', 'info');
    
    try {
        // Using a reliable, CORS-enabled endpoint
        const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');
        
        measureEventDelay(startTime, 'fetch-request');
        
        if (response.ok) {
            const data = await response.json();
            log('✅ Fetch request successful', 'success');
            log(`📄 Response data: ${data.title.substring(0, 50)}...`, 'info');
        } else {
            log('❌ Fetch request failed', 'error');
        }
    } catch (error) {
        measureEventDelay(startTime, 'fetch-request');
        log(`❌ Fetch blocked/failed: ${error.message}`, 'error');
        eventsBlocked++;
        updateMetrics();
    }
});

document.getElementById('localFetch').addEventListener('click', async function() {
    const startTime = performance.now();
    log('🌐 Starting local fetch test...', 'info');
    
    try {
        // Test fetch to same origin (should not have CORS issues)
        const response = await fetch(window.location.href);
        
        measureEventDelay(startTime, 'local-fetch-request');
        
        if (response.ok) {
            log('✅ Local fetch request successful', 'success');
        } else {
            log('❌ Local fetch request failed', 'error');
        }
    } catch (error) {
        measureEventDelay(startTime, 'local-fetch-request');
        log(`❌ Local fetch blocked/failed: ${error.message}`, 'error');
        eventsBlocked++;
        updateMetrics();
    }
});

document.getElementById('xhrTest').addEventListener('click', function() {
    const startTime = performance.now();
    log('🌐 Starting XMLHttpRequest test...', 'info');
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://jsonplaceholder.typicode.com/posts/1');
    
    xhr.onload = function() {
        measureEventDelay(startTime, 'xhr-request');
        if (xhr.status === 200) {
            log('✅ XHR request successful', 'success');
            const data = JSON.parse(xhr.responseText);
            log(`📄 XHR response: ${data.title.substring(0, 50)}...`, 'info');
        } else {
            log('❌ XHR request failed', 'error');
        }
    };
    
    xhr.onerror = function() {
        measureEventDelay(startTime, 'xhr-request');
        log('❌ XHR request blocked/failed', 'error');
        eventsBlocked++;
        updateMetrics();
    };
    
    xhr.ontimeout = function() {
        measureEventDelay(startTime, 'xhr-request');
        log('⏰ XHR request timed out (likely blocked)', 'warning');
        eventsBlocked++;
        updateMetrics();
    };
    
    xhr.timeout = 5000; // 5 second timeout
    
    try {
        xhr.send();
    } catch (error) {
        measureEventDelay(startTime, 'xhr-request');
        log(`❌ XHR blocked: ${error.message}`, 'error');
        eventsBlocked++;
        updateMetrics();
    }
});

document.getElementById('websocketTest').addEventListener('click', function() {
    const startTime = performance.now();
    log('🌐 Starting WebSocket test...', 'info');
    
    try {
        // Using a more reliable WebSocket endpoint
        const ws = new WebSocket('wss://socketsbay.com/wss/v2/1/demo/');
        
        ws.onopen = function() {
            measureEventDelay(startTime, 'websocket-connect');
            log('✅ WebSocket connected', 'success');
            ws.send('Hello WebSocket!');
        };
        
        ws.onmessage = function(event) {
            log(`📨 WebSocket message: ${event.data}`, 'info');
        };
        
        ws.onerror = function(error) {
            measureEventDelay(startTime, 'websocket-connect');
            log('❌ WebSocket connection blocked/failed', 'error');
            eventsBlocked++;
            updateMetrics();
        };
        
        ws.onclose = function(event) {
            if (event.wasClean) {
                log('👋 WebSocket connection closed cleanly', 'info');
            } else {
                log('💥 WebSocket connection closed unexpectedly', 'warning');
            }
        };
        
        // Close after 5 seconds
        setTimeout(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close(1000, 'Demo completed');
                log('👋 WebSocket connection closed by demo', 'info');
            } else if (ws.readyState === WebSocket.CONNECTING) {
                measureEventDelay(startTime, 'websocket-connect');
                log('⏰ WebSocket connection attempt timed out (likely blocked)', 'warning');
                eventsBlocked++;
                updateMetrics();
                ws.close();
            }
        }, 5000);
        
    } catch (error) {
        measureEventDelay(startTime, 'websocket-connect');
        log(`❌ WebSocket blocked: ${error.message}`, 'error');
        eventsBlocked++;
        updateMetrics();
    }
});

// Network form testing
document.getElementById('networkForm').addEventListener('submit', function(e) {
    const startTime = performance.now();
    log('📝 Network form submission intercepted...', 'warning');
    
    // Prevent actual submission for demo
    e.preventDefault();
    
    setTimeout(() => {
        measureEventDelay(startTime, 'form-network-submit');
        log('⚠️ Form submission would be blocked during analysis', 'warning');
    }, 10);
});

// Performance monitoring
setInterval(() => {
    // Check if events are taking too long
    if (delayMeasurements.length > 0) {
        const recentDelays = delayMeasurements.slice(-10);
        const avgRecent = recentDelays.reduce((a, b) => a + b, 0) / recentDelays.length;
        
        if (avgRecent > 200) {
            sequenceErrors++;
            log(`⚠️ Performance degradation detected: ${Math.round(avgRecent)}ms average delay`, 'error');
            updateMetrics();
        }
    }
}, 5000);

// Monitor for blocked events by checking if event handlers don't fire
let testEventFired = false;
function testEventBlocking() {
    testEventFired = false;
    
    // Create a synthetic click event
    const testDiv = document.createElement('div');
    testDiv.style.position = 'absolute';
    testDiv.style.top = '-1000px';
    testDiv.style.left = '-1000px';
    document.body.appendChild(testDiv);
    
    testDiv.addEventListener('click', () => {
        testEventFired = true;
    });
    
    testDiv.click();
    
    setTimeout(() => {
        if (!testEventFired) {
            log('🚨 Event blocking detected - synthetic click was prevented', 'error');
            eventsBlocked++;
            updateMetrics();
        }
        testDiv.remove();
    }, 100);
}

// Test event blocking every 10 seconds
setInterval(testEventBlocking, 10000);

// Hide context menu when clicking elsewhere
document.addEventListener('click', function(e) {
    const menu = document.getElementById('contextualMenu');
    if (!menu.contains(e.target)) {
        menu.style.display = 'none';
    }
});

// Initial load
log('🚀 Demo page loaded - Extension event handling issues will be visible when extension is active', 'info');
log('💡 Normal behavior: Events should process immediately (<10ms)', 'info');
log('⚠️ Extension behavior: Events blocked, delayed, or executed out of sequence', 'warning');
log('📋 Instructions: Try clicking buttons, typing in fields, and using Tab navigation', 'info');

// Test extension presence and baseline performance
setTimeout(() => {
    const baselineTest = performance.now();
    
    // Test if basic DOM manipulation is affected
    const testEl = document.createElement('span');
    testEl.textContent = 'test';
    document.body.appendChild(testEl);
    
    setTimeout(() => {
        const baselineDelay = performance.now() - baselineTest;
        
        if (baselineDelay > 20) {
            log('🚨 Baseline DOM operations are slow - extension likely active', 'error');
        }
        
        testEl.remove();
        
        if (eventsBlocked === 0 && delayMeasurements.length > 5) {
            const avgDelay = delayMeasurements.reduce((a, b) => a + b, 0) / delayMeasurements.length;
            if (avgDelay < 20) {
                log('✅ No extension interference detected - events processing normally', 'success');
            } else {
                log(`⚠️ Some delays detected: ${Math.round(avgDelay)}ms average`, 'warning');
            }
        } else if (eventsBlocked > 0) {
            log('🚨 Extension interference detected - events are being blocked/delayed', 'error');
        }
    }, 50);
}, 2000);
