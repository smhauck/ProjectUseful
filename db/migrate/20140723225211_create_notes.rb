class CreateNotes < ActiveRecord::Migration
  def change
    create_table :notes do |t|
      t.string :title
      t.text :body
      t.integer :creator_id
      t.references :note_privacy_type, index: true, null: false, default: 1
      t.references :product, index: true
      t.references :sprint, index: true
      t.references :story, index: true
      t.references :task, index: true

      t.timestamps
    end
  end
end
