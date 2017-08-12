class AddRequestorToStories < ActiveRecord::Migration[4.2]
  def change
    add_column :stories, :requestor_id, :integer
  end
end
