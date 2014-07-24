class CreateStoryStatusTypes < ActiveRecord::Migration
  def up
    create_table :story_status_types do |t|
      t.boolean :alive
      t.string :title
      t.string :code
      t.text :description

      t.timestamps
    end
  end

  def down
    drop_table :story_status_types
  end
end
