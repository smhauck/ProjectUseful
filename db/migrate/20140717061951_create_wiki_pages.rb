class CreateWikiPages < ActiveRecord::Migration
  def change
    create_table :wiki_pages do |t|
      t.string :title
      t.text :body
      t.integer :version
      t.references :product, index: true
      t.references :project, index: true
      t.references :story, index: true
      t.references :task, index: true
      t.references :user, index: true

      t.timestamps
    end
  end
end