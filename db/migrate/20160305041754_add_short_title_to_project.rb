class AddShortTitleToProject < ActiveRecord::Migration
  def change
    add_column :projects, :short_title, :string, limit: 10, null: false
  end
end
