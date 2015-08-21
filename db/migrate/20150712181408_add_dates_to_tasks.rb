class AddDatesToTasks < ActiveRecord::Migration
  def change
    add_column :tasks, :sched_start_date, :date
    add_column :tasks, :actual_start_date, :date
    add_column :tasks, :sched_completion_date, :date
    add_column :tasks, :actual_completion_date, :date
  end
end
