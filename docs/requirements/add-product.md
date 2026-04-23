## Page UI:. 
- On page visit: Collapse the side bar
- 2 Column Layout: 
    - The left contain these:
        - General
        - Product Options
        - Variants

    - The right Contain these info to filled:
        - Inventory (Hide if Product has variant and no variant is selected)
        - Shipping
        - Pricing,

        - If a variant is Selected:
            - Show toogle use Product Price Info in Pricing section (default to true and disabled edit)
            - Show toogle use Product Shipping Info in Shipping section (default to true and disabled edit)


## Add Product Page Include these info sections:
1. General:
- Title
- Category
- Description
- Media files
- Status

2. Product Options:
- Add option button
- Show these for each option added:
    - Option name input (Color, Size, Material, ...)
    - Option values: 
        - allow input one value at a time, 
        - on input changes, if it has value show another empty input below the filled input.
        - on input blur, if empty then remove the input and add another empty input at the end if there is not any.

    - Delete option button & Done button

- Maximum option: 2

- If there is no option, Imply there is 1 default variant with no option.

3. Variants:
- Update on Product options changes
- New created variants has the same shipping info and Price Info with product
- Group by option if has 2 or more options (selectable) 
- Has checkbox, on one or more checked, show three-dot button that dropdown actions for bulk edit
- Show summary info foreach variant 

4. Inventory
- Inventory tracked (Toggle)
- Quantity
- SKU
- Continue selling when out of stock (toggle) (Allow backorder)

5. Pricing
- Use Product Pricing Info (toggle)
- Price & currency (default to VND)
- Compare-at price
- Charge tax on this product (toggle)
- Cost input, on changes & != 0, calculate Profit and Margin

6. Shipping
- Use Product SHipping Info (toggle)
- Physical product (toggle)
- Package:  
    - Width ,   Height ,   Length  (cm)
    - Weight (kg) 