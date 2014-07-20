class AddAliveToStoryStatusTypes < ActiveRecord::Migration
  def up
    add_column :story_status_types, :alive, :boolean
    
    StoryStatusType.create(title: "Waiting", alive: "1")
    StoryStatusType.create(title: "In Progress", alive: "1")
    StoryStatusType.create(title: "Product Owner Review", alive: "1")
    StoryStatusType.create(title: "Product Owner Reject", alive: "1")
    StoryStatusType.create(title: "Product Owner Accept", alive: "1")
    StoryStatusType.create(title: "Client Review", alive: "1")
    StoryStatusType.create(title: "Client Reject", alive: "1")
    StoryStatusType.create(title: "Client Accept", alive: "1")
    StoryStatusType.create(title: "Production Push", alive: "1")
    StoryStatusType.create(title: "Production Review", alive: "1")
    StoryStatusType.create(title: "Complete", alive: "0")
    StoryStatusType.create(title: "Cancelled", alive: "0")
    StoryStatusType.create(title: "Deleted", alive: "0")
  end
end
