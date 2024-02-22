# AutoDoc.

Generate a knowledge base in autopilot.

(Work in progress.)

## Launch the project

1. Install the project sources

```sh
git clone https://github.com/Grouloo/autodoc.git
```

2. Install and run an instance of [PocketBase](https://pocketbase.io/docs/)

3. In your PocketBase dashboard, go to Settings > Import collections, and load the file `schema.json` located at the root of the project

4. In your PocketBase dashboard, go to Collections > applicatons > New Record, and create a new application with the username and password of your choice.

5. At the root of the project, copy the content of `_env` and paste it in a new file you'll name `.env`, and fill the missing information.

6. Install the project's dependencies

```sh
bun install
```

7. Run the project

```sh
bun dev
```

## Stack

It has all my favourite tools in it. So it's quite nice.

It's the... BTASHAPM stack? Let's just say it's the _bestest_ stack.

-  Bun (Runtime)
-  TypeScript (Language)
-  Astro (Framework)
-  [Shulk](https://github.com/Grouloo/shulk) (Utils)
-  HTMX (Client-to-backend communication)
-  Alpine (Client-side reactivity)
-  PocketBase (Database)
-  Mistral (Large Language Model)
