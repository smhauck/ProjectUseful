class CreateMeetings < ActiveRecord::Migration[4.2]
  def change
    create_table :meetings do |t|
      t.datetime :scheduled
      t.string :title
      t.string :subject
      t.text :description
      t.text :notes
      t.integer :creator_id, class: :user, index: true, foreign_key: true
      t.integer :owner_id, class: :user, index: true, foreign_key: true

      t.timestamps null: false
    end
  end
end
