# Managing the Shahpara website from WordPress

The website reads everything from WordPress (shahpara.pk/wp-admin). You never need to touch code.
Changes appear on the site within about 5 minutes, or straight away once the webhook below is set up.

## Products

| To… | In wp-admin |
| --- | --- |
| Add a product | **Products → Add New** → fill in name, price, description, photos, categories → **Publish** |
| Edit price, photos or text | Open the product → change → **Update** |
| Hide a product | Set it to **Draft** (or move to Bin) |
| Mark out of stock | Product → **Inventory** → Stock status: *Out of stock* (shown as sold out; can't be ordered) |
| Personalisation fields (names, dates, extras) | The same YITH product options you use today — the site shows them exactly |
| Size / colour options with their own price | A **Variable product** with variations |

## Categories

- Create or rename: **Products → Categories**.
- Put a product in a category: tick it on the product page.
- Every category has its own page at `/product-category/<category-slug>`.

## Order of products

**Products → Sorting** (or *Products → All Products → Sorting*): drag products into the order you want.
The site uses this order everywhere — shop, categories, collections and occasions.
Products you never sorted stay newest-first.

## Homepage

| Homepage section | How to choose what shows |
| --- | --- |
| **Signature pieces** rail | Click the ★ star next to a product in *Products → All Products* (Featured) |
| **Wedding & Nikkah** spotlight (4 products) | Add the product tag `home-wedding` |
| **Eid** spotlight (4 products) | Add the product tag `home-eid` |
| **From the studio** photo gallery (up to 8) | Add the product tag `home-gallery` |

If nothing is starred or tagged for a section, the site shows the original selection, so a section is never empty.

## Collections and occasions

Collections (Cards & letters, Personalised gifts, Handmade, Wedding & Nikkah, Home decor) and occasions
(Eid, Ramadan, Weddings, Mere Mahboob, Mother's Day, Father's Day & for him, Birthdays) are filled automatically
from their categories. To add any other product, give it a tag:

| Page | Tag to add |
| --- | --- |
| Cards, letters & memory books | `collection-cards-and-letters` |
| Personalised gifts | `collection-personalised-gifts` |
| Handmade crafts | `collection-handmade` |
| Wedding & Nikkah | `collection-wedding-and-nikkah` |
| Home decor | `collection-home-decor` |
| Eid | `occasion-eid` |
| Ramadan | `occasion-ramadan` |
| Weddings & Nikkah (occasion) | `occasion-wedding` |
| Mere Mahboob | `occasion-mere-mahboob` |
| Mother's Day | `occasion-mothers-day` |
| Father's Day & for him | `occasion-for-him` |
| Birthdays & celebrations | `occasion-birthdays` |

## Orders

Every checkout on the new site is saved in **WooCommerce → Orders** as *On hold — awaiting bank transfer*
(with all personalisation details on each line), and the customer also sends it to you on WhatsApp with the same order number.

## Instant updates (one-time setup)

**WooCommerce → Settings → Advanced → Webhooks → Add webhook**, three times — one each for
*Product created*, *Product updated* and *Product deleted*:

- **Status:** Active
- **Delivery URL:** `https://<your-vercel-site>/api/revalidate`
- **Secret:** the `WC_WEBHOOK_SECRET` value (same as in Vercel)
- **API version:** WP REST API Integration v3

## If something goes wrong

If WordPress can't be reached, the site keeps working from the last saved copy of the products.
Hostinger's CDN bot protection ("Checking your browser…") can block the site from reading WordPress —
if products stop updating, check that it isn't switched on for `/wp-json/`.
