class AddCompletionNoteToStory < ActiveRecord::Migration[4.2]
  def change
    add_column :stories, :completion_notes, :text
  end
end
