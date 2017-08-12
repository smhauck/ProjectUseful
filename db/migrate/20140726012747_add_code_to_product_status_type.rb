class AddCodeToProductStatusType < ActiveRecord::Migration[4.2]
  def up
    add_column :product_status_types, :code, :string, null: false, default: "FIXME"

    # update code based on title
    execute <<-SQL
      update product_status_types set code = 'waiting' where title = 'Waiting';
    SQL
    execute <<-SQL
      update product_status_types set code = 'in_progress' where title = 'In Progress';
    SQL
    execute <<-SQL
      update product_status_types set code = 'complete' where title = 'Complete';
    SQL
    execute <<-SQL
      update product_status_types set code = 'cancelled' where title = 'Cancelled';
    SQL
  end

  def down
    remove_column :product_status_types, :code
  end
end
