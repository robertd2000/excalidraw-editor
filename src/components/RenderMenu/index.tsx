import { MainMenu } from "@excalidraw/excalidraw";

export const RenderMenu = () => {
  return (
    <MainMenu>
      <MainMenu.DefaultItems.SaveAsImage />
      <MainMenu.DefaultItems.Export />
      <MainMenu.Separator />
      <MainMenu.DefaultItems.LiveCollaborationTrigger
        isCollaborating={false}
        onSelect={() => window.alert("You clicked on collab button")}
      />
      <MainMenu.Group title='Excalidraw links'>
        <MainMenu.DefaultItems.Socials />
      </MainMenu.Group>
      <MainMenu.Separator />
      <MainMenu.DefaultItems.Help />
    </MainMenu>
  );
};
