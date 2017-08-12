class AddShortTitleToProject < ActiveRecord::Migration[4.2]
  def change
    add_column :projects, :short_title, :string, limit: 15, null: false
  end
end
