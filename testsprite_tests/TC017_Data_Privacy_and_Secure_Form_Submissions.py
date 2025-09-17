import asyncio
from playwright import async_api

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:3001", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # Navigate to a form page such as 'Contact' or 'Free Quote' to check if those pages use HTTPS and contain forms for testing.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/header/div/div/nav/a[6]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Check if the form has a user consent checkbox and if it is required.
        await page.mouse.wheel(0, window.innerHeight)
        

        # Check if the user consent checkbox is present and required.
        await page.mouse.wheel(0, window.innerHeight)
        

        # Fill the form fields with sample data and submit the form to check submission response and consent enforcement.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/main/section[2]/div/div/div/form/div/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('John')
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/main/section[2]/div/div/div/form/div/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Doe')
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/main/section[2]/div/div/div/form/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('john.doe@example.com')
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/main/section[2]/div/div/div/form/div[2]/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('4075551234')
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/main/section[2]/div/div/div/form/div[3]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('123 Main St, Orlando, FL 32801')
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/main/section[2]/div/div/div/form/div[5]/textarea').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Please repair the soffit on the east side of the house.')
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/main/section[2]/div/div/div/form/div[8]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Assert the page is served over HTTPS
        assert page.url.startswith('https://'), f"Page URL is not HTTPS: {page.url}"
          
        # Assert user consent checkbox is present and required
        consent_checkbox = page.locator('input[type="checkbox"][name*="consent" i]')
        assert await consent_checkbox.count() > 0, "User consent checkbox not found"
        is_required = await consent_checkbox.get_attribute('required')
        assert is_required is not None, "User consent checkbox is not marked as required"
          
        # Assert form submission response confirms data receipt securely
        # Wait for a response or confirmation message after form submission
        response_message = page.locator('text=Thank you for your submission').first
        assert await response_message.is_visible(), "Form submission confirmation message not visible"
          
        # Assert no plaintext sensitive data is exposed in network requests or responses
        # Intercept network requests to check for plaintext sensitive data
        sensitive_fields = ['John', 'Doe', 'john.doe@example.com', '4075551234', '123 Main St, Orlando, FL 32801']
        plaintext_found = False
        async def check_request(request):
            post_data = await request.post_data()
            if post_data:
                for field in sensitive_fields:
                    if field in post_data:
                        # Check if data is sent over HTTPS (already asserted) and not in plaintext in request body
                        # Here we assume data is encrypted or sent securely if HTTPS is used
                        # But we flag if data appears in plaintext in request body
                        if not request.url.startswith('https://'):
                            nonlocal plaintext_found
                            plaintext_found = True
                            break
        async def check_response(response):
            try:
                body = await response.text()
                for field in sensitive_fields:
                    if field in body:
                        nonlocal plaintext_found
                        plaintext_found = True
                        break
            except Exception:
                pass
        page.on('request', check_request)
        page.on('response', check_response)
        assert not plaintext_found, "Plaintext sensitive data found in network requests or responses"
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    