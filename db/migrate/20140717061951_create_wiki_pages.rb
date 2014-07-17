class CreateWikiPages < ActiveRecord::Migration
  def change
    create_table :wiki_pages do |t|
      t.string :title
      t.text :body
      t.integer :version
      t.references :Product, index: true
      t.references :Project, index: true
      t.references :Story, index: true
      t.references :Task, index: true
      t.references :User, index: true

      t.timestamps
    end
  end
end
