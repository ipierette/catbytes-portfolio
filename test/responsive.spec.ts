// tests/responsiveness.spec.ts
import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://ipierette.github.io/catbytes-portifolio/';

// Breakpoints usados nos testes
const viewports = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

/**
 * Executa o mesmo conjunto de testes para cada breakpoint.
 * Utiliza page.setViewportSize(...) para simular diferentes tamanhos de tela.
 */
function runViewportSuite({ name, width, height }: { name: string; width: number; height: number }) {
  test.describe(`${name} viewport (${width}x${height})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(BASE_URL);
    });

    test('Seções principais são exibidas corretamente', async ({ page }) => {
      // 1. Header com logotipo e menu
      await expect(page.locator('header .logo img')).toBeVisible();
      if (name === 'mobile') {
        await expect(page.locator('#menu-toggle')).toBeVisible();
      } else {
        await expect(page.locator('#menu-toggle')).toBeHidden();
        await expect(page.locator('nav ul')).toBeVisible();
      }

      // 2. Seção de apresentação (hero)
      const hero = page.locator('#hero');
      await expect(hero.locator('#hero-title')).toContainText('Bem-vindo');
      await expect(hero.locator('img[alt="gato sentado"]')).toBeVisible();

      // 3. Portfólio
      const projects = page.locator('#projects');
      await projects.scrollIntoViewIfNeeded();
      await expect(projects.locator('#project-image')).toBeVisible();

      // 4. Sobre Mim
      const about = page.locator('#about');
      await about.scrollIntoViewIfNeeded();
      await expect(about.locator('img')).toBeVisible();
      await expect(about.locator('p')).toBeVisible();

      // 5. Tecnologias (skills)
      const skills = page.locator('#skills');
      await skills.scrollIntoViewIfNeeded();
      await expect(skills.locator('.skill-card').first()).toBeVisible();

      // 6. Contato (e-mail, redes sociais e botão de copiar)
      const contact = page.locator('#contact');
      await contact.scrollIntoViewIfNeeded();
      await expect(contact.locator('input[type="email"]')).toBeVisible();
      await expect(contact.locator('a[aria-label*="LinkedIn"]')).toBeVisible();
      await expect(contact.locator('a[aria-label*="GitHub"]')).toBeVisible();
      // Falhará se o botão #copy-email não existir.
      await expect(contact.locator('#copy-email')).toBeVisible();

      // 7. Footer com direitos autorais
      const footer = page.locator('footer');
      await footer.scrollIntoViewIfNeeded();
      await expect(footer).toContainText('Todos os direitos reservados');
    });

    test('Botão "Voltar ao Topo" funciona', async ({ page }) => {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      const backToTop = page.locator('#back-to-top');
      await expect(backToTop).toBeVisible();
      await backToTop.click();
      await page.waitForFunction(() => window.scrollY === 0);
    });

    test('Modo escuro via toggle é persistente', async ({ page }) => {
      const toggle = page.locator('#theme-toggle, #theme-toggle-mobile');
      await toggle.first().click();
      await expect(page.locator('body')).toHaveClass(/dark-mode/);
      await page.reload();
      await expect(page.locator('body')).toHaveClass(/dark-mode/);
    });

    test('Animações de scroll não quebram o layout', async ({ page }) => {
      const sections = page.locator('section.section-animated');
      const count = await sections.count();
      for (let i = 0; i < count; i++) {
        const section = sections.nth(i);
        await section.scrollIntoViewIfNeeded();
        await expect(section).toBeVisible();
        await expect(section).toHaveClass(/is-visible/);
      }
    });

    test('Menu hambúrguer aparece apenas em telas pequenas', async ({ page }) => {
      const toggle = page.locator('#menu-toggle');
      const mobileMenu = page.locator('#mobile-menu'); // esperado id `#menu-mobile`
      if (name === 'mobile') {
        await expect(toggle).toBeVisible();
        await toggle.click();
        await expect(mobileMenu).toBeVisible();
      } else {
        await expect(toggle).toBeHidden();
        await expect(mobileMenu).toBeHidden();
      }
    });
  });
}

// Aplica a suíte a todos os breakpoints
viewports.forEach(runViewportSuite);
