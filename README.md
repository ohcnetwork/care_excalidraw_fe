# CARE Hello

> A simple hello world CARE App boilerplate to get you started with CARE App development.

## Getting Started

1. Clone the repository and navigate to the project directory.

```bash
git clone
cd care_hello
```

2. Install the dependencies.

```bash
npm install
```

3. Start the development server.

```bash
npm run dev
```

## Setting up your local app in CARE

Make sure you have CARE running locally. Then, follow these steps:

1. Open the CARE Admin Dashboard in your browser (usually at `http://localhost:4000/admin`).

2. Navigate to the "Apps" section and click on "Add New Config".

3. Add a slug, and specify the following as the Meta:

```
{
  "url": "http://localhost:4173/assets/remoteEntry.js",
  "name": "care-hello-fe"
}
```

4. Save the configuration and reload CARE.

5. Head over to a patient encounter page, and you should see a new "Hello!" button. Click on it to see the "Hello CARE!" page.

Tip: while developing this plugin, you can open `http://localhost:4173` to view a local status page that includes these setup steps and quick links.

# Updating configuration

The manifest is located at `src/manifest.tsx`. You can add new routes, components, and other configurations here. The boilerplate includes a sample route for a `Hello` page and a navigation link to access it. Types are provided for the manifest configuration to help you with type checking and autocompletion.

## Adding new routes

Update the manifest's `routes` object to include new routes. For example, to add a new route for a `Hello` page, you can do the following:

```tsx
import Hello from "./pages/Hello";

export const manifest = {
  // ...
  routes: {
    "/hello": () => (
      <Page>
        <Hello />
      </Page>
    ),
  },
};
```

## Adding new components

You can mount custom components in the app by adding them in `components` in the manifest. For example, to add a new `Button` component, you can do the following:

```tsx
export const manifest = {
  // ...
  components: {
    PatientInfoCardQuickActions: lazy(() => import("./components/Button")),
  },
};
```

CARE will then inject the `Button` component into wherever the `PatientInfoCardQuickActions` slot is defined in CARE's UI. You can find the list of available slots [here](https://github.com/ohcnetwork/care_fe/blob/4c47494a862203cbb4c83c0cd4b73a06de585da9/src/pluginTypes.ts#L88). If you want to create your own custom slot, you can do that as well.

## Add new navigation links

You can add new navigation links to the sidebar, user menu, or admin sidebar by updating the manifest. For example -

```tsx
export const manifest = {
  // ...
  userNavItems: [
    {
      url: "/hello";
      name: "Hello";
      icon?: <icon/>;
      children?: NavigationLink[];
    }
  ],
};

```
