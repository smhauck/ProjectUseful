class CreateStoryAssignments < ActiveRecord::Migration[4.2]
  def change
    create_table :story_assignments do |t|
      t.references :story, index: true
      t.references :user, index: true

      t.timestamps
    end
  end
end
