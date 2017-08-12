class CreateBlogs < ActiveRecord::Migration[4.2]
  def change
    create_table :blogs do |t|
      t.string :title
      t.text :description
      t.references :user, index: true

      t.timestamps
    end
  end
end
