class CreateStoryTypes < ActiveRecord::Migration
  def change
    create_table :story_types do |t|
      t.string :title
      t.text :description

      t.timestamps
    end
  end
end
